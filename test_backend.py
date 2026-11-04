"""
Automated unit & integration verification for library AI backend.
"""

import sys
import os

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

sys.path.append(os.path.dirname(__file__))

from database import LibraryDatabase
from knowledge_graph import KnowledgeGraphEngine
from navigation_engine import NavigationEngine
from rag_engine import RAGEngine
from comparison_engine import ComparisonEngine
from librarian_agent import LibrarianAgent

def run_tests():
    print("Testing Library Database...")
    db = LibraryDatabase()
    books = db.get_all_books()
    assert len(books) >= 20, f"Expected at least 20 books, got {len(books)}"
    print(f"✓ Database loaded {len(books)} books.")

    print("\nTesting Knowledge Graph...")
    kg = KnowledgeGraphEngine(db)
    full_graph = kg.get_full_graph()
    stats = full_graph["stats"]
    assert stats["total_nodes"] > 30, "Graph nodes count is low"
    assert stats["total_edges"] > 30, "Graph edges count is low"
    print(f"✓ Knowledge graph constructed: {stats['total_nodes']} nodes, {stats['total_edges']} edges, {stats['learning_paths']} pathways.")

    print("\nTesting Navigation & A* Pathfinding Engine...")
    nav = NavigationEngine(db)
    # Test same-floor routing
    route_same = nav.find_route_to_book("cs-aima", origin_floor=1, origin_name="kiosk")
    assert "instructions" in route_same and len(route_same["instructions"]) > 0
    print(f"✓ Same-floor route generated: {route_same['estimated_distance_m']}m, {route_same['tier_visual']['tier_name']}.")

    # Test multi-floor routing (Floor 1 to Floor 2)
    route_multi = nav.find_route_to_book("lit-dune", origin_floor=1, origin_name="kiosk")
    assert len(route_multi["segments"]) == 2, "Expected 2 segments for multi-floor route"
    print(f"✓ Multi-floor route (Floor 1 -> Floor 2) generated: {route_multi['estimated_distance_m']}m, {len(route_multi['instructions'])} steps.")

    print("\nTesting RAG Semantic Vector Recommendation Engine...")
    rag = RAGEngine(db)
    rec1 = rag.retrieve_and_recommend("books on deep neural networks and machine intelligence")
    assert len(rec1["recommendations"]) > 0
    top = rec1["recommendations"][0]
    print(f"✓ RAG retrieved: '{top['book']['title']}' (Score: {top['relevance_score']}, Confidence: {top['confidence_percentage']}).")
    print(f"  Grounded Excerpt: {top['grounded_excerpt'][:80]}...")

    print("\nTesting AI Comparison Studio Engine...")
    comp = ComparisonEngine(db)
    cmp_res = comp.compare_books(["lit-1984", "lit-brave-new-world"])
    assert len(cmp_res["dimensions"]) == 5
    assert len(cmp_res["radar_series"]) == 2
    print(f"✓ Comparison generated successfully. Verdict: {cmp_res['ai_verdict']['recommended_sequence'][:80]}...")

    print("\nTesting Conversational Librarian Agent (Athena)...")
    agent = LibrarianAgent(db, nav, rag, comp, kg)
    # 1. Location intent
    c_loc = agent.process_message("Where is Dune located?")
    assert c_loc["intent"] == "LOCATE_BOOK", f"Expected LOCATE_BOOK, got {c_loc['intent']}"
    print(f"✓ Agent detected LOCATE_BOOK intent correctly.")

    # 2. Compare intent
    c_cmp = agent.process_message("Compare 1984 and Brave New World")
    assert c_cmp["intent"] == "COMPARE_BOOKS", f"Expected COMPARE_BOOKS, got {c_cmp['intent']}"
    print(f"✓ Agent detected COMPARE_BOOKS intent correctly.")

    # 3. Learning path intent
    c_path = agent.process_message("Show me a learning path for AI")
    assert c_path["intent"] == "EXPLORE_LEARNING_PATH"
    print(f"✓ Agent detected EXPLORE_LEARNING_PATH intent correctly.")

    # 4. Classification intent
    c_ddc = agent.process_message("What is Dewey Decimal Classification?")
    assert c_ddc["intent"] == "EXPLAIN_CLASSIFICATION"
    print(f"✓ Agent detected EXPLAIN_CLASSIFICATION intent correctly.")

    print("\n🎉 ALL BACKEND SUBSYSTEM TESTS PASSED WITH 100% SUCCESS!\n")

if __name__ == "__main__":
    run_tests()
