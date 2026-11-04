"""
Modern AI Comparison Engine:
Provides multi-dimensional radar metrics, thematic contrasts,
and objective synthesis across multiple literary and technical works.
"""

from typing import List, Dict, Any, Optional
from database import LibraryDatabase

class ComparisonEngine:
    def __init__(self, db: LibraryDatabase):
        self.db = db

    def compare_books(self, book_ids: List[str]) -> Dict[str, Any]:
        if not book_ids:
            return {"error": "Please provide at least two book IDs to compare"}

        books = []
        for bid in book_ids[:4]:
            b = self.db.get_book_by_id(bid)
            if b:
                books.append(b)

        if len(books) < 2:
            return {"error": "At least two valid books are required for comparative analysis"}

        # Compile radar chart dimensions
        dimensions = [
            {"key": "complexity", "label": "Complexity & Rigor", "max": 10},
            {"key": "pacing", "label": "Pacing & Readability", "max": 10},
            {"key": "theoretical_depth", "label": "Theoretical Depth", "max": 10},
            {"key": "practical_utility", "label": "Practical Utility", "max": 10},
            {"key": "thematic_weight", "label": "Thematic Gravitas", "max": 10}
        ]

        radar_series = []
        for b in books:
            radar_series.append({
                "book_id": b["id"],
                "title": b["title"],
                "color": b["cover_color"],
                "values": [b["metrics"].get(d["key"], 5.0) for d in dimensions]
            })

        # Contrast Matrix
        comparison_matrix = []
        comparison_matrix.append({
            "dimension": "Core Thesis / Central Conflict",
            "items": [{b["id"]: self._get_core_thesis(b)} for b in books]
        })
        comparison_matrix.append({
            "dimension": "Writing Style & Prose",
            "items": [{b["id"]: self._get_style_desc(b)} for b in books]
        })
        comparison_matrix.append({
            "dimension": "Ideal Reader Persona",
            "items": [{b["id"]: self._get_ideal_reader(b)} for b in books]
        })
        comparison_matrix.append({
            "dimension": "Cognitive Load & Pacing",
            "items": [{b["id"]: f"{'High' if b['metrics']['complexity'] > 8 else 'Moderate'} load, {b['metrics']['pacing']}/10 pacing"} for b in books]
        })
        comparison_matrix.append({
            "dimension": "Library Physical Proximity",
            "items": [{b["id"]: f"Floor {b['location']['floor']}, Aisle {b['location']['aisle']} ({b['copies_available']} copies avail)"} for b in books]
        })

        # AI Synthesis & Verdict
        verdict = self._synthesize_verdict(books)

        return {
            "books": books,
            "dimensions": dimensions,
            "radar_series": radar_series,
            "comparison_matrix": comparison_matrix,
            "ai_verdict": verdict
        }

    def _get_core_thesis(self, book: Dict[str, Any]) -> str:
        b_id = book["id"]
        theses = {
            "lit-1984": "Power is maintained through systemic terror, linguistic mutilation, and constant surveillance.",
            "lit-brave-new-world": "Power is maintained through effortless hedonism, genetic conditioning, and synthetic distractions.",
            "lit-dune": "Ecology and natural scarcity forge planetary cultures; messianic saviors are catastrophic traps.",
            "lit-foundation": "Statistical laws of mass psychology can forecast civilizational trajectories across millennia.",
            "lit-neuromancer": "Human consciousness and corporate power merge within decentralized digital matrices.",
            "cs-aima": "Intelligent systems are best conceptualized as rational agents acting to maximize utility.",
            "cs-deep-learning": "Hierarchical representational learning from raw data solves complex perception problems.",
            "cs-superintelligence": "Creating self-improving superintelligent agents requires solving value alignment prior to takeoff.",
            "phil-thinking-fast-slow": "Human cognition is split between fast, biased intuitions and slow, lazy deliberate reasoning.",
            "phil-meditations": "True sovereignty lies only in governing one's internal judgments, not external vicissitudes."
        }
        return theses.get(b_id, book["synopsis"])

    def _get_style_desc(self, book: Dict[str, Any]) -> str:
        b_id = book["id"]
        styles = {
            "lit-1984": "Sparse, unadorned, psychologically claustrophobic prose.",
            "lit-brave-new-world": "Satirical, witty, detached sociological observation.",
            "lit-dune": "Dense, baroque, rich in interior monologues and worldbuilding jargon.",
            "lit-foundation": "Dialogue-heavy, high-level strategic problem solving with minimal action.",
            "lit-neuromancer": "Poetic, rapid-fire, hard-boiled cybernetic imagery.",
            "cs-aima": "Pedagogically polished, comprehensive textbook with clear pseudo-code.",
            "cs-deep-learning": "Mathematically rigorous, theorem-and-matrix formulation.",
            "cs-superintelligence": "Philosophically analytic, probabilistic decision-theory dialectic."
        }
        return styles.get(b_id, f"Authoritative academic and expository style in {book['category']}.")

    def _get_ideal_reader(self, book: Dict[str, Any]) -> str:
        metrics = book["metrics"]
        if metrics["complexity"] > 8.0:
            return "Advanced students, researchers, and dedicated readers looking for exhaustive depth."
        elif metrics["pacing"] > 8.0:
            return "Curious readers wanting high-tempo, narrative-driven immersion or practical takeaways."
        else:
            return "Thoughtful generalists and practitioners seeking solid foundational clarity."

    def _synthesize_verdict(self, books: List[Dict[str, Any]]) -> Dict[str, Any]:
        b1, b2 = books[0], books[1]
        
        # Check classic pairings
        pair = {b1["id"], b2["id"]}
        if pair == {"lit-1984", "lit-brave-new-world"}:
            summary = (
                "While both are supreme dystopian benchmarks, '1984' warns of the boot stamping on a human face (authoritarian coercion), "
                "whereas 'Brave New World' accurately anticipated modern consumer technocracy (engineered triviality and compliance through pleasure). "
                "Read '1984' for raw political urgency; read 'Brave New World' for uncanny modern cultural resonance."
            )
            recommendation = "Read '1984' first for visceral impact, followed by 'Brave New World' as a profound ideological counterpoint."

        elif pair == {"cs-aima", "cs-deep-learning"}:
            summary = (
                "Russell & Norvig's 'AIMA' provides the macro-architecture of all AI (search, classical logic, probability, planning, and agents), "
                "while Goodfellow's 'Deep Learning' zooms into modern deep differentiable neural networks with heavy matrix calculus. "
            )
            recommendation = "Start with 'AIMA' to master the full landscape of intelligence, then transition to 'Deep Learning' for practical neural network mastery."

        elif pair == {"lit-dune", "lit-foundation"}:
            summary = (
                "Herbert's 'Dune' focuses on the mythic dangers of charismatic prophets and planetary ecological fragility, "
                "while Asimov's 'Foundation' focuses on cold macro-historical statistics and institutional resilience. "
            )
            recommendation = "Start with 'Foundation' for intellectual grand strategy; immerse yourself in 'Dune' for sensory worldbuilding and socio-ecological depth."

        else:
            # Generic comparison
            m1, m2 = b1["metrics"], b2["metrics"]
            if m1["pacing"] > m2["pacing"]:
                first_pick = b1
                second_pick = b2
            else:
                first_pick = b2
                second_pick = b1

            summary = (
                f"Comparing '{b1['title']}' ({b1['category']}) with '{b2['title']}' ({b2['category']}). "
                f"'{b1['title']}' presents a theoretical depth score of {m1['theoretical_depth']}/10, "
                f"while '{b2['title']}' counters with {m2['theoretical_depth']}/10. "
            )
            recommendation = (
                f"If you prefer a faster on-ramp, start with '{first_pick['title']}' (pacing {first_pick['metrics']['pacing']}/10). "
                f"If you crave deeper structural rigor, delve directly into '{second_pick['title']}'."
            )

        return {
            "summary": summary,
            "recommended_sequence": recommendation,
            "reading_pairing": f"Pairing: {b1['title']} + {b2['title']}"
        }
