"""
Intelligent Librarian Agent: 'Athena'
A multi-turn conversational agent with intent recognition and tool execution for
catalog search, shelf routing, multi-book comparison, and learning pathways.
"""

import re
from typing import Dict, List, Any, Optional
from database import LibraryDatabase
from navigation_engine import NavigationEngine
from rag_engine import RAGEngine
from comparison_engine import ComparisonEngine
from knowledge_graph import KnowledgeGraphEngine

class LibrarianAgent:
    def __init__(
        self,
        db: LibraryDatabase,
        nav_engine: NavigationEngine,
        rag_engine: RAGEngine,
        comp_engine: ComparisonEngine,
        kg_engine: KnowledgeGraphEngine
    ):
        self.db = db
        self.nav_engine = nav_engine
        self.rag_engine = rag_engine
        self.comp_engine = comp_engine
        self.kg_engine = kg_engine
        self.books = self.db.get_all_books()

    def process_message(self, message: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        msg_clean = message.strip()
        msg_lower = msg_clean.lower()

        # 1. Check for Book Navigation / Location Intent
        # e.g., "Where is Dune?", "How do I find AIMA?", "Take me to Floor 1", "Locate Deep Learning"
        matched_book = self._match_book_in_text(msg_lower)
        is_locate_intent = any(w in msg_lower for w in ["where is", "how do i find", "locate", "directions to", "take me to", "which shelf", "way to"])

        if matched_book and is_locate_intent:
            return self._handle_locate_book(matched_book)

        # 2. Check for Comparison Intent
        # e.g., "Compare 1984 and Brave New World", "Dune vs Foundation", "Difference between AIMA and Deep Learning"
        is_compare_intent = any(w in msg_lower for w in ["compare", "vs", "versus", "difference between", "better between", "which one should i read"])
        if is_compare_intent:
            matched_books = self._match_multiple_books(msg_lower)
            if len(matched_books) >= 2:
                return self._handle_compare_books(matched_books)

        # 3. Check for Reservation Intent
        # e.g., "Reserve Dune", "Hold a copy of Deep Learning", "Checkout 1984"
        is_reserve_intent = any(w in msg_lower for w in ["reserve", "hold", "checkout", "borrow", "keep a copy"])
        if matched_book and is_reserve_intent:
            return self._handle_reserve_book(matched_book)

        # 4. Check for Learning Path / Roadmap Intent
        # e.g., "Roadmap for AI", "Learning path for Dystopia", "Curriculum on consciousness"
        is_path_intent = any(w in msg_lower for w in ["learning path", "roadmap", "curriculum", "reading order", "sequence", "syllabus"])
        if is_path_intent:
            return self._handle_learning_path(msg_lower)

        # 5. Check for Classification / Dewey Decimal Explanation Intent
        # e.g., "What is 006.3?", "Explain Dewey Decimal", "What is call number"
        is_ddc_intent = any(w in msg_lower for w in ["dewey", "ddc", "call number", "classification", "how are books arranged"])
        if is_ddc_intent or re.search(r"\b\d{3}(\.\d+)?\b", msg_lower):
            return self._handle_classification_inquiry(msg_lower)

        # 6. Check for Specific Book Inquiry
        if matched_book and any(w in msg_lower for w in ["tell me about", "summary of", "synopsis", "what is", "about"]):
            return self._handle_book_inquiry(matched_book)

        # 7. Default to RAG Recommendation / Semantic Advisory
        return self._handle_rag_advisory(msg_clean)

    def _match_book_in_text(self, text: str) -> Optional[Dict[str, Any]]:
        for b in self.books:
            title_lower = b["title"].lower()
            # Direct title match or significant acronym
            if title_lower in text:
                return b
            if b["id"] == "cs-aima" and ("aima" in text or "norvig" in text or "russell" in text):
                return b
            if b["id"] == "sci-geb" and ("geb" in text or "hofstadter" in text or "escher" in text):
                return b
            if b["id"] == "cs-sicp" and ("sicp" in text or "wizard book" in text or "structure and interpretation" in text):
                return b
            if b["id"] == "cs-ddia" and ("ddia" in text or "kleppmann" in text or "data-intensive" in text):
                return b
            if b["id"] == "phil-thinking-fast-slow" and ("kahneman" in text or "system 1" in text or "fast and slow" in text):
                return b
            if b["id"] == "lit-dune" and "dune" in text:
                return b
            if b["id"] == "lit-1984" and ("1984" in text or "orwell" in text):
                return b
            if b["id"] == "lit-brave-new-world" and ("brave new world" in text or "huxley" in text):
                return b
            if b["id"] == "lit-foundation" and ("foundation" in text or "asimov" in text or "seldon" in text):
                return b
            if b["id"] == "lit-snow-crash" and ("snow crash" in text or "stephenson" in text or "metaverse" in text):
                return b
            if b["id"] == "lit-neuromancer" and ("neuromancer" in text or "gibson" in text or "case" in text):
                return b
            if b["id"] == "hist-sapiens" and ("sapiens" in text or "harari" in text):
                return b
            if b["id"] == "phil-meditations" and ("meditations" in text or "marcus aurelius" in text or "stoic" in text):
                return b
        return None

    def _match_multiple_books(self, text: str) -> List[Dict[str, Any]]:
        matched = []
        for b in self.books:
            title_lower = b["title"].lower()
            author_lower = b["author"].lower()
            # Check short tokens
            words = [w for w in title_lower.split() if len(w) > 3]
            if title_lower in text:
                matched.append(b)
            elif any(w in text for w in ["1984", "brave new world", "dune", "foundation", "neuromancer", "snow crash", "sapiens", "aima", "deep learning", "superintelligence", "meditations"]):
                if b["id"] == "lit-1984" and "1984" in text and b not in matched:
                    matched.append(b)
                elif b["id"] == "lit-brave-new-world" and "brave new world" in text and b not in matched:
                    matched.append(b)
                elif b["id"] == "lit-dune" and "dune" in text and b not in matched:
                    matched.append(b)
                elif b["id"] == "lit-foundation" and "foundation" in text and b not in matched:
                    matched.append(b)
                elif b["id"] == "cs-aima" and "aima" in text and b not in matched:
                    matched.append(b)
                elif b["id"] == "cs-deep-learning" and "deep learning" in text and b not in matched:
                    matched.append(b)
                elif b["id"] == "cs-superintelligence" and "superintelligence" in text and b not in matched:
                    matched.append(b)
                elif b["id"] == "phil-meditations" and "meditations" in text and b not in matched:
                    matched.append(b)
        return matched

    def _handle_locate_book(self, book: Dict[str, Any]) -> Dict[str, Any]:
        route = self.nav_engine.find_route_to_book(book["id"], origin_floor=1, origin_name="kiosk")
        loc = book["location"]
        instructions_text = " ".join(route.get("instructions", []))

        text = (
            f"**{book['title']}** by {book['author']} is located on **Floor {loc['floor']}** in the **{loc['section']}**.\n\n"
            f"📍 **Shelf Location:** Aisle **{loc['aisle']}**, Shelf Unit **#{loc['shelf_unit']}**, **Tier {loc['tier']}** ({route['tier_visual']['tier_name']}).\n"
            f"🏷️ **Call Number:** `{book['ddc_code']}`\n\n"
            f"🚶 **Estimated Walk:** {route.get('estimated_distance_m')} meters (~{route.get('estimated_time_seconds')}s from the Central Kiosk).\n\n"
            f"**Turn-by-turn guidance:**\n" +
            "\n".join([f"{i+1}. {step}" for i, step in enumerate(route.get("instructions", []))])
        )

        return {
            "role": "librarian",
            "message": text,
            "intent": "LOCATE_BOOK",
            "action": {
                "type": "OPEN_MAP",
                "book_id": book["id"],
                "floor": loc["floor"],
                "shelf_label": loc["shelf_label"],
                "route": route
            },
            "suggested_actions": [
                f"Compare '{book['title']}' with related titles",
                f"Reserve this volume (Hold Shelf)",
                "Show in Knowledge Graph"
            ]
        }

    def _handle_compare_books(self, books: List[Dict[str, Any]]) -> Dict[str, Any]:
        book_ids = [b["id"] for b in books]
        comparison = self.comp_engine.compare_books(book_ids)
        verdict = comparison["ai_verdict"]

        text = (
            f"Here is an AI-powered comparison between **{books[0]['title']}** and **{books[1]['title']}**:\n\n"
            f"⚖️ **Core Contrast:**\n{verdict['summary']}\n\n"
            f"💡 **Reading Sequence Recommendation:**\n{verdict['recommended_sequence']}\n\n"
            f"You can explore the interactive 5-axis Radar Chart in the Comparison Studio to analyze complexity, pacing, theoretical rigor, and practical utility."
        )

        return {
            "role": "librarian",
            "message": text,
            "intent": "COMPARE_BOOKS",
            "action": {
                "type": "OPEN_COMPARISON",
                "book_ids": book_ids,
                "comparison": comparison
            },
            "suggested_actions": [
                f"Locate '{books[0]['title']}' on Floor Map",
                f"Locate '{books[1]['title']}' on Floor Map",
                "Recommend books similar to these"
            ]
        }

    def _handle_reserve_book(self, book: Dict[str, Any]) -> Dict[str, Any]:
        res = self.db.reserve_book(book["id"], user_name="Patron")
        if res.get("success"):
            text = (
                f"✨ **Reservation Confirmed!**\n\n"
                f"I have placed a 48-hour hold on **{book['title']}**.\n"
                f"📦 **Pickup Station:** {res['hold_shelf']}\n"
                f"📚 **Remaining Copies:** {res['copies_remaining']} copies still available for checkout.\n"
                f"Need walking directions to the hold lockers?"
            )
        else:
            text = f"Notice: {res.get('error', 'Unable to reserve at this time.')}"

        return {
            "role": "librarian",
            "message": text,
            "intent": "RESERVE_BOOK",
            "action": {
                "type": "RESERVATION_RESULT",
                "result": res
            },
            "suggested_actions": [
                f"Where is {book['location']['section']}?",
                "Explore similar works in this category"
            ]
        }

    def _handle_learning_path(self, text: str) -> Dict[str, Any]:
        paths = self.kg_engine.get_all_learning_paths()
        # Find closest path
        selected_path = paths[0]
        if "dystopi" in text or "power" in text:
            selected_path = next((p for p in paths if p["path"]["id"] == "dystopian-power"), paths[0])
        elif "history" in text or "sociology" in text or "sapiens" in text:
            selected_path = next((p for p in paths if p["path"]["id"] == "speculative-sociology"), paths[0])
        elif "mind" in text or "stoic" in text or "decision" in text:
            selected_path = next((p for p in paths if p["path"]["id"] == "mind-and-choice"), paths[0])
        elif "ai" in text or "neural" in text or "learning" in text:
            selected_path = next((p for p in paths if p["path"]["id"] == "ai-foundations"), paths[0])

        p_info = selected_path["path"]
        books_list = selected_path["books"]

        seq_text = "\n".join([f"{i+1}. **{b['title']}** ({b['author']}) - *DDC {b['ddc_code']}* [Floor {b['location']['floor']}]" for i, b in enumerate(books_list)])

        msg = (
            f"🎓 **Curated Pathway: {p_info['name']}**\n\n"
            f"*{p_info['description']}*\n"
            f"**Level:** {p_info['difficulty']}\n\n"
            f"**Sequential Reading Curriculum:**\n{seq_text}\n\n"
            f"Would you like me to map out the physical walking route for the first title in this track?"
        )

        return {
            "role": "librarian",
            "message": msg,
            "intent": "EXPLORE_LEARNING_PATH",
            "action": {
                "type": "SHOW_LEARNING_PATH",
                "path_id": p_info["id"],
                "path_data": selected_path
            },
            "suggested_actions": [
                f"Locate '{books_list[0]['title']}' on map",
                "View this sequence in Knowledge Graph"
            ]
        }

    def _handle_classification_inquiry(self, text: str) -> Dict[str, Any]:
        msg = (
            "🏛️ **Understanding the Library's Spatial Classification System:**\n\n"
            "Our library organizes physical stacks using the **Dewey Decimal Classification (DDC)** system synchronized with spatial zones:\n\n"
            "• **Floor 1 (Grand Atrium & Sci-Tech Pavilion):**\n"
            "  - `000 - 006`: Computer Science, AI, Distributed Systems & Algorithms (Aisles B1-B4)\n"
            "  - `500 - 530`: Natural Sciences, Mathematical Logic & Cosmology (Aisles A1-A4)\n\n"
            "• **Floor 2 (Humanities & Philosophy Mezzanine):**\n"
            "  - `100 - 188`: Philosophy, Stoicism, Theory of Mind & Ethics (Aisles D1-D4)\n"
            "  - `300 - 332`: Economics & Political Economy (Aisles E3-E4)\n"
            "  - `800 - 823`: Literature, Speculative Sci-Fi & Dystopian Classics (Aisles C1-C4)\n"
            "  - `900 - 909`: World History & Civilization (Aisles E1-E2)\n\n"
            "Every call number (e.g. `006.3 RUS`) specifies the discipline, subdivision, and author cutter number for exact shelf placement."
        )

        return {
            "role": "librarian",
            "message": msg,
            "intent": "EXPLAIN_CLASSIFICATION",
            "action": {"type": "SHOW_TAXONOMY"},
            "suggested_actions": [
                "Show Floor 1 Computer Science stacks",
                "Show Floor 2 Humanities stacks"
            ]
        }

    def _handle_book_inquiry(self, book: Dict[str, Any]) -> Dict[str, Any]:
        msg = (
            f"📖 **{book['title']}**\n"
            f"*By {book['author']} ({book['year']})*\n\n"
            f"**Classification:** `{book['ddc_code']}` | **Category:** {book['category']}\n"
            f"**Shelf Location:** Floor {book['location']['floor']}, Aisle {book['location']['aisle']}, {book['location']['shelf_label']}\n"
            f"**Availability:** {book['copies_available']} / {book['copies_total']} copies available on shelf.\n\n"
            f"**Synopsis:**\n{book['synopsis']}\n\n"
            f"💬 **Grounded Excerpt:**\n*\"{book['key_excerpt']}\"*\n\n"
            f"**Cognitive Profile:** Pacing {book['metrics']['pacing']}/10, Complexity {book['metrics']['complexity']}/10, Depth {book['metrics']['theoretical_depth']}/10."
        )

        return {
            "role": "librarian",
            "message": msg,
            "intent": "BOOK_INQUIRY",
            "action": {
                "type": "HIGHLIGHT_BOOK",
                "book": book
            },
            "suggested_actions": [
                f"Take me to '{book['title']}' on the map",
                f"Reserve '{book['title']}'",
                f"Compare '{book['title']}' with similar titles"
            ]
        }

    def _handle_rag_advisory(self, query: str) -> Dict[str, Any]:
        rag_res = self.rag_engine.retrieve_and_recommend(query, top_k=3)
        recs = rag_res.get("recommendations", [])

        if not recs:
            text = (
                "I couldn't find an exact match in our immediate collection, but I can guide you through our major sections: "
                "Computer Science (Floor 1), Theoretical Physics (Floor 1), Philosophy (Floor 2), or Speculative Literature (Floor 2). "
                "What specific themes or questions are you investigating?"
            )
            return {
                "role": "librarian",
                "message": text,
                "intent": "GENERAL_ADVISORY",
                "suggested_actions": ["Show AI books", "Explore Dystopian classics", "Philosophy recommendations"]
            }

        top_book = recs[0]["book"]
        recs_text = []
        for i, r in enumerate(recs):
            b = r["book"]
            recs_text.append(
                f"{i+1}. **{b['title']}** by {b['author']} (Match: {r['confidence_percentage']})\n"
                f"   • *Why:* {r['synthesis_rationale']}\n"
                f"   • *Shelf:* Floor {b['location']['floor']}, Aisle {b['location']['aisle']} (`{b['ddc_code']}`)"
            )

        text = (
            f"Based on your query: *\"{query}\"*, I synthesized these recommendations using our semantic retrieval engine:\n\n" +
            "\n\n".join(recs_text) + "\n\n"
            f"Would you like me to map out a navigation route to **{top_book['title']}** or initiate a side-by-side comparison?"
        )

        return {
            "role": "librarian",
            "message": text,
            "intent": "RAG_RECOMMENDATION",
            "action": {
                "type": "SHOW_RECOMMENDATIONS",
                "recommendations": recs
            },
            "suggested_actions": [
                f"Locate '{top_book['title']}' on Floor Map",
                f"Compare '{recs[0]['book']['title']}' vs '{recs[1]['book']['title']}'" if len(recs) > 1 else "Show Knowledge Graph",
                "Reserve top recommendation"
            ]
        }
