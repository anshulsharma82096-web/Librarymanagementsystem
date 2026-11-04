"""
In-memory HTTP Handler verification without requiring OS network socket.
"""

import sys
import os
import io
import json

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

sys.path.append(os.path.dirname(__file__))
from app import LibraryAPIHandler

class MockSocket:
    def __init__(self, request_bytes):
        self._rfile = io.BytesIO(request_bytes)
        self._wfile = io.BytesIO()

    def makefile(self, mode, *args, **kwargs):
        if "b" in mode:
            if "r" in mode:
                return self._rfile
            elif "w" in mode:
                return self._wfile
        return self._rfile

    def sendall(self, b):
        self._wfile.write(b)

class MockServer:
    pass

def simulate_request(method, path, body=None):
    body_bytes = body.encode("utf-8") if isinstance(body, str) else (body or b"")
    req_lines = [
        f"{method} {path} HTTP/1.1",
        "Host: localhost",
        f"Content-Length: {len(body_bytes)}",
        "Content-Type: application/json",
        "",
        ""
    ]
    raw_request = "\r\n".join(req_lines).encode("utf-8") + body_bytes
    
    mock_sock = MockSocket(raw_request)
    # Instantiate handler with mock
    handler = LibraryAPIHandler(mock_sock, ("127.0.0.1", 12345), MockServer())
    
    # Read response
    response_data = mock_sock._wfile.getvalue()
    parts = response_data.split(b"\r\n\r\n", 1)
    headers_raw = parts[0].decode("utf-8", errors="replace")
    body_raw = parts[1] if len(parts) > 1 else b""
    
    status_line = headers_raw.splitlines()[0]
    status_code = int(status_line.split()[1])
    
    return status_code, headers_raw, body_raw

def run_tests():
    print("Testing In-Memory HTTP API & Static File Router...")

    endpoints = [
        ("GET", "/", 200, "text/html"),
        ("GET", "/styles.css", 200, "text/css"),
        ("GET", "/app.js", 200, "application/javascript"),
        ("GET", "/components/map_view.js", 200, "application/javascript"),
        ("GET", "/components/librarian_chat.js", 200, "application/javascript"),
        ("GET", "/components/comparison_view.js", 200, "application/javascript"),
        ("GET", "/components/rag_view.js", 200, "application/javascript"),
        ("GET", "/components/graph_view.js", 200, "application/javascript"),
        ("GET", "/components/catalog_view.js", 200, "application/javascript"),
        ("GET", "/api/health", 200, "application/json"),
        ("GET", "/api/books", 200, "application/json"),
        ("GET", "/api/taxonomy", 200, "application/json"),
        ("GET", "/api/knowledge-graph", 200, "application/json"),
        ("GET", "/api/navigation/floors/1", 200, "application/json"),
        ("GET", "/api/navigation/floors/2", 200, "application/json"),
        ("GET", "/api/learning-paths", 200, "application/json")
    ]

    for method, path, expected_status, expected_ct in endpoints:
        status, headers, body = simulate_request(method, path)
        assert status == expected_status, f"Expected {expected_status} for {path}, got {status}"
        assert expected_ct in headers, f"Expected {expected_ct} in headers for {path}, got {headers}"
        print(f"✓ {method} {path:30} -> HTTP {status} ({len(body)} bytes, {expected_ct})")

    # Test POST /api/navigation/route
    nav_payload = json.dumps({"book_id": "cs-aima", "origin_floor": 1, "origin_name": "kiosk"})
    status, headers, body = simulate_request("POST", "/api/navigation/route", nav_payload)
    assert status == 200
    res = json.loads(body.decode("utf-8"))
    assert "estimated_distance_m" in res
    print(f"✓ POST /api/navigation/route          -> HTTP 200 ({res['estimated_distance_m']}m route)")

    # Test POST /api/librarian/chat
    chat_payload = json.dumps({"message": "Where is Dune?"})
    status, headers, body = simulate_request("POST", "/api/librarian/chat", chat_payload)
    assert status == 200
    res = json.loads(body.decode("utf-8"))
    assert res["intent"] == "LOCATE_BOOK"
    print(f"✓ POST /api/librarian/chat            -> HTTP 200 (Intent: {res['intent']})")

    # Test POST /api/rag/recommend
    rag_payload = json.dumps({"query": "cyberpunk artificial intelligence", "top_k": 3})
    status, headers, body = simulate_request("POST", "/api/rag/recommend", rag_payload)
    assert status == 200
    res = json.loads(body.decode("utf-8"))
    assert len(res["recommendations"]) > 0
    print(f"✓ POST /api/rag/recommend             -> HTTP 200 (Top: {res['recommendations'][0]['book']['title']})")

    # Test POST /api/comparison
    comp_payload = json.dumps({"book_ids": ["lit-1984", "lit-brave-new-world"]})
    status, headers, body = simulate_request("POST", "/api/comparison", comp_payload)
    assert status == 200
    res = json.loads(body.decode("utf-8"))
    assert "radar_series" in res
    print(f"✓ POST /api/comparison                -> HTTP 200 ({len(res['radar_series'])} series)")

    # Test POST /api/books/lit-dune/reserve
    reserve_payload = json.dumps({"user_name": "Reader"})
    status, headers, body = simulate_request("POST", "/api/books/lit-dune/reserve", reserve_payload)
    assert status == 200
    res = json.loads(body.decode("utf-8"))
    assert res["success"] is True
    print(f"✓ POST /api/books/lit-dune/reserve    -> HTTP 200 (Hold Shelf: {res['hold_shelf']})")

    print("\n🎉 ALL IN-MEMORY HTTP HANDLER TESTS PASSED WITH 100% SUCCESS!\n")

if __name__ == "__main__":
    run_tests()
