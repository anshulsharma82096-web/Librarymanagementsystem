"""
Verify HTTP server and static/API routes.
"""

import sys
import os
import time
import threading
import urllib.request
import json

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

sys.path.append(os.path.dirname(__file__))
from app import run_server

def probe():
    port = 8011
    t = threading.Thread(target=run_server, args=(port,), daemon=True)
    t.start()
    time.sleep(1.0)

    base = f"http://127.0.0.1:{port}"
    endpoints = [
        ("/", 200, "text/html"),
        ("/styles.css", 200, "text/css"),
        ("/app.js", 200, "application/javascript"),
        ("/components/map_view.js", 200, "application/javascript"),
        ("/components/librarian_chat.js", 200, "application/javascript"),
        ("/components/comparison_view.js", 200, "application/javascript"),
        ("/components/rag_view.js", 200, "application/javascript"),
        ("/components/graph_view.js", 200, "application/javascript"),
        ("/components/catalog_view.js", 200, "application/javascript"),
        ("/api/health", 200, "application/json"),
        ("/api/books", 200, "application/json"),
        ("/api/taxonomy", 200, "application/json"),
        ("/api/knowledge-graph", 200, "application/json"),
        ("/api/navigation/floors/1", 200, "application/json"),
        ("/api/navigation/floors/2", 200, "application/json"),
        ("/api/learning-paths", 200, "application/json")
    ]

    print("Probing HTTP & API Endpoints...")
    for ep, expected_status, content_type_part in endpoints:
        url = base + ep
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=3) as resp:
            assert resp.status == expected_status, f"Failed {ep}: expected {expected_status}, got {resp.status}"
            ct = resp.headers.get("Content-Type", "")
            assert content_type_part in ct, f"Failed {ep} content type: expected {content_type_part}, got {ct}"
            data = resp.read()
            print(f"✓ {ep:32} -> HTTP {resp.status} ({len(data)} bytes, {ct})")

    # Test POST /api/navigation/route
    post_data = json.dumps({"book_id": "cs-aima", "origin_floor": 1, "origin_name": "kiosk"}).encode("utf-8")
    req = urllib.request.Request(base + "/api/navigation/route", data=post_data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=3) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        assert "estimated_distance_m" in res
        print(f"✓ {'POST /api/navigation/route':32} -> HTTP 200 ({res['estimated_distance_m']}m route)")

    # Test POST /api/librarian/chat
    chat_data = json.dumps({"message": "Where is Dune?"}).encode("utf-8")
    req = urllib.request.Request(base + "/api/librarian/chat", data=chat_data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=3) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        assert res["intent"] == "LOCATE_BOOK"
        print(f"✓ {'POST /api/librarian/chat':32} -> HTTP 200 (Intent: {res['intent']})")

    # Test POST /api/rag/recommend
    rag_data = json.dumps({"query": "cyberpunk and artificial intelligence", "top_k": 3}).encode("utf-8")
    req = urllib.request.Request(base + "/api/rag/recommend", data=rag_data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=3) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        assert len(res["recommendations"]) > 0
        top_title = res["recommendations"][0]["book"]["title"]
        print(f"✓ {'POST /api/rag/recommend':32} -> HTTP 200 (Top: {top_title})")

    # Test POST /api/comparison
    comp_data = json.dumps({"book_ids": ["lit-1984", "lit-brave-new-world"]}).encode("utf-8")
    req = urllib.request.Request(base + "/api/comparison", data=comp_data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=3) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        assert "radar_series" in res
        print(f"✓ {'POST /api/comparison':32} -> HTTP 200 ({len(res['radar_series'])} series)")

    print("\n🎉 ALL HTTP STATIC ASSETS AND API ENDPOINTS VERIFIED WITH 100% SUCCESS!\n")

if __name__ == "__main__":
    probe()
