"""
Alexandria AI - Library Book Recommendation & Navigation System Launcher
Usage:
    python run.py [port]
"""

import sys
import os
import webbrowser
import threading
import time

# Add backend directory to sys.path
backend_dir = os.path.join(os.path.dirname(__file__), "backend")
sys.path.insert(0, backend_dir)

from app import run_server

def main():
    try:
        port = int(os.environ.get("PORT", sys.argv[1] if len(sys.argv) > 1 else 8000))
    except ValueError:
        port = 8000

    host = os.environ.get("HOST", "0.0.0.0")
    url = f"http://{host}:{port}"
    print(f"\n==================================================================")
    print(f"🏛️  ALEXANDRIA AI: LIBRARY BOOK RECOMMENDATION & NAVIGATION SYSTEM")
    print(f"==================================================================")
    print(f"  • Knowledge Graph: Dewey Classification, Subjects & Roadmaps")
    print(f"  • Search-Based Navigation: A* Multi-Floor Pathfinding & Shelf HUD")
    print(f"  • Intelligent Librarian Agent: 'Athena' Multi-Turn Chat & Actions")
    print(f"  • Modern AI Comparison: 5-Axis Radar Chart & Thematic Contrast")
    print(f"  • RAG Recommender: Hybrid Dense Vector Retrieval & Grounded Excerpts")
    print(f"==================================================================")
    print(f"  ➜ Access UI & API at: {url}")
    print(f"==================================================================\n")

    # Launch browser only if running in desktop interactive mode (not in cloud container)
    if "PORT" not in os.environ and "RENDER" not in os.environ:
        def open_browser():
            time.sleep(1.2)
            try:
                webbrowser.open(f"http://127.0.0.1:{port}")
            except Exception:
                pass

        threading.Thread(target=open_browser, daemon=True).start()

    run_server(port, host=host)

if __name__ == "__main__":
    main()
