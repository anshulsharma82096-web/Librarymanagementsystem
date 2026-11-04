"""
Production Full-Stack Application Server:
Serves RESTful API endpoints and single-page application frontend.
Built with Python standard library HTTP server + multi-threading.
"""

import sys
import os
import json
import urllib.parse
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from typing import Dict, Any

from database import LibraryDatabase
from knowledge_graph import KnowledgeGraphEngine
from navigation_engine import NavigationEngine
from rag_engine import RAGEngine
from comparison_engine import ComparisonEngine
from librarian_agent import LibrarianAgent
from seed_data import SUBJECT_TAXONOMY

# Initialize application subsystems
db = LibraryDatabase()
kg_engine = KnowledgeGraphEngine(db)
nav_engine = NavigationEngine(db)
rag_engine = RAGEngine(db)
comp_engine = ComparisonEngine(db)
librarian_agent = LibrarianAgent(db, nav_engine, rag_engine, comp_engine, kg_engine)

# Determine frontend directory (supports both standard and flattened directory layouts)
base_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.abspath(os.path.join(base_dir, ".."))

if os.path.exists(os.path.join(parent_dir, "frontend")):
    FRONTEND_DIR = os.path.join(parent_dir, "frontend")
elif os.path.exists(os.path.join(base_dir, "frontend")):
    FRONTEND_DIR = os.path.join(base_dir, "frontend")
elif os.path.exists(os.path.join(parent_dir, "index.html")):
    FRONTEND_DIR = parent_dir
else:
    FRONTEND_DIR = base_dir

class LibraryAPIHandler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def _send_json_response(self, data: Any, status: int = 200):
        body = json.dumps(data, indent=2).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(body)

    def _send_file_response(self, file_path: str, content_type: str):
        try:
            with open(file_path, "rb") as f:
                content = f.read()
            self.send_response(200)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Length", str(len(content)))
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(f"File not found: {e}".encode("utf-8"))

    def do_OPTIONS(self):
        self.send_response(204)
        self._send_cors_headers()
        self.end_headers()

    def do_HEAD(self):
        # Health check support for Render, AWS, and Cloud Run
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query_params = urllib.parse.parse_qs(parsed.query)

        # 1. API Endpoints
        if path == "/api/health":
            self._send_json_response({"status": "healthy", "service": "Library AI Navigator"})

        elif path == "/api/books":
            q = query_params.get("q", [""])[0]
            cat = query_params.get("category", [""])[0]
            floor = None
            if "floor" in query_params:
                try:
                    floor = int(query_params["floor"][0])
                except ValueError:
                    pass
            books = db.search_books(query=q, category=cat, floor=floor)
            self._send_json_response({"total": len(books), "books": books})

        elif path.startswith("/api/books/"):
            book_id = path[len("/api/books/"):]
            # Ensure not a sub-action
            if "/" not in book_id:
                book = db.get_book_by_id(book_id)
                if book:
                    self._send_json_response(book)
                else:
                    self._send_json_response({"error": "Book not found"}, 404)
            else:
                self._send_json_response({"error": "Endpoint not found"}, 404)

        elif path == "/api/taxonomy":
            self._send_json_response({
                "taxonomy": SUBJECT_TAXONOMY,
                "categories": db.get_categories()
            })

        elif path == "/api/knowledge-graph":
            book_id = query_params.get("book_id", [None])[0]
            if book_id:
                data = kg_engine.get_book_neighborhood(book_id)
            else:
                data = kg_engine.get_full_graph()
            self._send_json_response(data)

        elif path == "/api/learning-paths":
            paths = kg_engine.get_all_learning_paths()
            self._send_json_response({"learning_paths": paths})

        elif path.startswith("/api/learning-paths/"):
            pid = path[len("/api/learning-paths/"):]
            path_data = kg_engine.get_learning_path(pid)
            if path_data:
                self._send_json_response(path_data)
            else:
                self._send_json_response({"error": "Learning path not found"}, 404)

        elif path.startswith("/api/navigation/floors/"):
            floor_str = path[len("/api/navigation/floors/"):]
            try:
                floor_num = int(floor_str)
                f_data = nav_engine.get_floor_details(floor_num)
                self._send_json_response(f_data)
            except ValueError:
                self._send_json_response({"error": "Invalid floor number"}, 400)

        # 2. Static Frontend Serving
        else:
            rel_path = path.lstrip("/")
            if not rel_path:
                rel_path = "index.html"

            target_file = os.path.abspath(os.path.join(FRONTEND_DIR, rel_path))

            # Prevent directory traversal
            if not target_file.startswith(FRONTEND_DIR) or not os.path.exists(target_file):
                # Fallback to index.html for SPA routing
                target_file = os.path.join(FRONTEND_DIR, "index.html")

            # Determine content type
            ext = os.path.splitext(target_file)[1].lower()
            mime_map = {
                ".html": "text/html; charset=utf-8",
                ".js": "application/javascript; charset=utf-8",
                ".css": "text/css; charset=utf-8",
                ".json": "application/json; charset=utf-8",
                ".svg": "image/svg+xml",
                ".png": "image/png",
                ".jpg": "image/jpeg",
                ".ico": "image/x-icon"
            }
            content_type = mime_map.get(ext, "application/octet-stream")
            self._send_file_response(target_file, content_type)

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        # Read JSON body
        content_length = int(self.headers.get("Content-Length", 0))
        body_bytes = self.rfile.read(content_length)
        try:
            body = json.loads(body_bytes.decode("utf-8")) if body_bytes else {}
        except Exception:
            body = {}

        if path == "/api/navigation/route":
            book_id = body.get("book_id", "")
            orig_floor = body.get("origin_floor", 1)
            orig_name = body.get("origin_name", "kiosk")
            route = nav_engine.find_route_to_book(book_id, origin_floor=orig_floor, origin_name=orig_name)
            self._send_json_response(route)

        elif path == "/api/rag/recommend":
            query = body.get("query", "")
            top_k = body.get("top_k", 4)
            cat_filter = body.get("category_filter")
            mood_filter = body.get("mood_filter")
            results = rag_engine.retrieve_and_recommend(
                query=query,
                top_k=top_k,
                category_filter=cat_filter,
                mood_filter=mood_filter
            )
            self._send_json_response(results)

        elif path == "/api/comparison":
            book_ids = body.get("book_ids", [])
            comparison = comp_engine.compare_books(book_ids)
            self._send_json_response(comparison)

        elif path == "/api/librarian/chat":
            message = body.get("message", "")
            context = body.get("context", {})
            response = librarian_agent.process_message(message, context=context)
            self._send_json_response(response)

        elif path.startswith("/api/books/") and path.endswith("/reserve"):
            # Extract book_id: /api/books/<book_id>/reserve
            parts = path.split("/")
            if len(parts) >= 4:
                book_id = parts[3]
                user_name = body.get("user_name", "Patron")
                res = db.reserve_book(book_id, user_name)
                self._send_json_response(res)
            else:
                self._send_json_response({"error": "Invalid reserve endpoint"}, 400)

        else:
            self._send_json_response({"error": "Endpoint not found"}, 404)

    def log_message(self, format, *args):
        # Clean console log
        sys.stderr.write(f"[{self.log_date_time_string()}] {self.address_string()} - {format % args}\n")

def run_server(port: int = None, host: str = "0.0.0.0"):
    # Read port from environment (Render, Railway, Fly.io provide PORT)
    if port is None:
        try:
            port = int(os.environ.get("PORT", 8000))
        except ValueError:
            port = 8000

    server_address = (host, port)
    httpd = ThreadingHTTPServer(server_address, LibraryAPIHandler)
    print(f"\n=======================================================")
    print(f"🏛️  AI-Based Library Navigator & Recommendation System")
    print(f"    Running at: http://{host}:{port}")
    print(f"=======================================================\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
        httpd.server_close()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", sys.argv[1] if len(sys.argv) > 1 else 8000))
    run_server(port, host="0.0.0.0")
