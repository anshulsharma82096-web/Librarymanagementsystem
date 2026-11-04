"""
Knowledge Representation Engine:
Constructs and analyzes the multidimensional ontology of subjects, books, concepts,
authors, prerequisites, and learning paths.
"""

from typing import Dict, List, Any, Optional
from database import LibraryDatabase
from seed_data import SUBJECT_TAXONOMY, LEARNING_PATHS

class KnowledgeGraphEngine:
    def __init__(self, db: LibraryDatabase):
        self.db = db
        self.nodes = []
        self.edges = []
        self._build_graph()

    def _build_graph(self):
        books = self.db.get_all_books()
        nodes_dict = {}
        edges = []

        # 1. Subject Taxonomy Nodes
        for code, info in SUBJECT_TAXONOMY.items():
            subj_id = f"subj-{code}"
            nodes_dict[subj_id] = {
                "id": subj_id,
                "label": info["name"],
                "type": "subject",
                "code": code,
                "floor": info["floor"],
                "color": info["color"],
                "size": 28,
                "description": f"Dewey Decimal Classification Class {code}xx"
            }

        # 2. Learning Path Nodes
        for path in LEARNING_PATHS:
            p_id = f"path-{path['id']}"
            nodes_dict[p_id] = {
                "id": p_id,
                "label": path["name"],
                "type": "learning_path",
                "difficulty": path["difficulty"],
                "description": path["description"],
                "color": "#10b981",
                "size": 22
            }

        # Concept extraction map
        concepts = {
            "concept-ai-agents": {"label": "Intelligent Agents & Autonomy", "category": "AI"},
            "concept-neural-deep": {"label": "Deep Learning & Neural Representations", "category": "AI"},
            "concept-alignment": {"label": "AI Alignment & Existential Risk", "category": "AI"},
            "concept-strange-loops": {"label": "Strange Loops & Self-Reference", "category": "Cognition"},
            "concept-consciousness": {"label": "Consciousness & Theory of Mind", "category": "Philosophy"},
            "concept-heuristics": {"label": "Cognitive Biases & Dual Systems", "category": "Psychology"},
            "concept-stoic-calm": {"label": "Stoic Resilience & Inner Fortress", "category": "Philosophy"},
            "concept-totalitarianism": {"label": "Totalitarianism & Surveillance", "category": "Sociology"},
            "concept-pleasure-control": {"label": "Technocratic Pleasure Conditioning", "category": "Sociology"},
            "concept-cyberspace": {"label": "Cyberspace & Virtual Realities", "category": "Speculative"},
            "concept-psychohistory": {"label": "Statistical Sociology & Civilizational Cycles", "category": "Speculative"},
            "concept-ecology-power": {"label": "Ecology & Messianic Politics", "category": "Speculative"},
            "concept-shared-fictions": {"label": "Shared Intersubjective Fictions", "category": "History"},
            "concept-capital-growth": {"label": "Rate of Return vs Growth (r > g)", "category": "Economics"}
        }

        for cid, cinfo in concepts.items():
            nodes_dict[cid] = {
                "id": cid,
                "label": cinfo["label"],
                "type": "concept",
                "color": "#ec4899",
                "size": 18
            }

        # Book to Concept mapping
        book_concept_map = {
            "cs-aima": ["concept-ai-agents", "concept-neural-deep"],
            "cs-deep-learning": ["concept-neural-deep"],
            "cs-superintelligence": ["concept-ai-agents", "concept-alignment"],
            "cs-sicp": ["concept-strange-loops"],
            "cs-master-algo": ["concept-ai-agents", "concept-neural-deep"],
            "sci-geb": ["concept-strange-loops", "concept-consciousness"],
            "phil-thinking-fast-slow": ["concept-heuristics", "concept-consciousness"],
            "phil-meditations": ["concept-stoic-calm"],
            "phil-consciousness-explained": ["concept-consciousness", "concept-strange-loops"],
            "phil-justice": ["concept-heuristics"],
            "lit-dune": ["concept-ecology-power"],
            "lit-neuromancer": ["concept-cyberspace", "concept-ai-agents"],
            "lit-1984": ["concept-totalitarianism"],
            "lit-brave-new-world": ["concept-pleasure-control"],
            "lit-foundation": ["concept-psychohistory"],
            "lit-snow-crash": ["concept-cyberspace"],
            "hist-sapiens": ["concept-shared-fictions"],
            "hist-guns-germs-steel": ["concept-shared-fictions"],
            "econ-capital-21": ["concept-capital-growth"]
        }

        # 3. Book Nodes and Edges
        for book in books:
            b_id = book["id"]
            # Color based on category or cover
            nodes_dict[b_id] = {
                "id": b_id,
                "label": book["title"],
                "type": "book",
                "author": book["author"],
                "year": book["year"],
                "ddc": book["ddc_code"],
                "floor": book["location"]["floor"],
                "aisle": book["location"]["aisle"],
                "shelf": book["location"]["shelf_label"],
                "category": book["category"],
                "rating": book["rating"],
                "color": book["cover_color"],
                "size": 24
            }

            # Author node
            author_id = f"author-{hash(book['author']) & 0xfffffff}"
            if author_id not in nodes_dict:
                nodes_dict[author_id] = {
                    "id": author_id,
                    "label": book["author"],
                    "type": "author",
                    "color": "#8b5cf6",
                    "size": 16
                }
            edges.append({
                "source": b_id,
                "target": author_id,
                "relation": "AUTHORED_BY",
                "label": "Authored By"
            })

            # Edge to Subject (DDC Class)
            ddc_prefix = book["ddc_code"][:1] + "00"
            subj_id = f"subj-{ddc_prefix}"
            if subj_id in nodes_dict:
                edges.append({
                    "source": b_id,
                    "target": subj_id,
                    "relation": "BELONGS_TO_SUBJECT",
                    "label": "Classified Under"
                })

            # Concepts
            if b_id in book_concept_map:
                for cid in book_concept_map[b_id]:
                    if cid in nodes_dict:
                        edges.append({
                            "source": b_id,
                            "target": cid,
                            "relation": "EXPLORES_CONCEPT",
                            "label": "Explores"
                        })

            # Prerequisites (directed edges)
            for prereq in book.get("prerequisites", []):
                # If prereq is another book id
                if prereq in [b["id"] for b in books]:
                    edges.append({
                        "source": prereq,
                        "target": b_id,
                        "relation": "PREREQUISITE_FOR",
                        "label": "Prerequisite For"
                    })

        # 4. Learning Path Edges (sequence order)
        for path in LEARNING_PATHS:
            p_id = f"path-{path['id']}"
            seq = path["sequence"]
            for i, bid in enumerate(seq):
                if bid in nodes_dict:
                    edges.append({
                        "source": p_id,
                        "target": bid,
                        "relation": "IN_LEARNING_PATH",
                        "label": f"Step #{i+1}"
                    })
                    # Chain consecutive books in path
                    if i > 0 and seq[i-1] in nodes_dict:
                        edges.append({
                            "source": seq[i-1],
                            "target": bid,
                            "relation": "PATH_FOLLOWS",
                            "label": "Next in Sequence"
                        })

        # 5. Duality / Thematic Contrasts
        edges.append({
            "source": "lit-1984",
            "target": "lit-brave-new-world",
            "relation": "THEMATIC_CONTRAST",
            "label": "Pain vs Pleasure Dystopia"
        })
        edges.append({
            "source": "lit-neuromancer",
            "target": "lit-snow-crash",
            "relation": "EVOLUTION_OF_GENRE",
            "label": "Gritty Cyberpunk to Satirical Metaverse"
        })
        edges.append({
            "source": "cs-superintelligence",
            "target": "cs-aima",
            "relation": "CRITICAL_EXTENSION",
            "label": "From Capability to Safety"
        })

        self.nodes = list(nodes_dict.values())
        self.edges = edges

    def get_full_graph(self) -> Dict[str, Any]:
        return {
            "nodes": self.nodes,
            "edges": self.edges,
            "stats": {
                "total_nodes": len(self.nodes),
                "total_edges": len(self.edges),
                "books": len([n for n in self.nodes if n["type"] == "book"]),
                "subjects": len([n for n in self.nodes if n["type"] == "subject"]),
                "concepts": len([n for n in self.nodes if n["type"] == "concept"]),
                "authors": len([n for n in self.nodes if n["type"] == "author"]),
                "learning_paths": len(LEARNING_PATHS)
            }
        }

    def get_book_neighborhood(self, book_id: str, depth: int = 1) -> Dict[str, Any]:
        """Returns the ego-network / subgraph around a specific book."""
        connected_node_ids = {book_id}
        sub_edges = []

        for edge in self.edges:
            if edge["source"] == book_id or edge["target"] == book_id:
                connected_node_ids.add(edge["source"])
                connected_node_ids.add(edge["target"])
                sub_edges.append(edge)

        sub_nodes = [n for n in self.nodes if n["id"] in connected_node_ids]
        return {
            "center": book_id,
            "nodes": sub_nodes,
            "edges": sub_edges
        }

    def get_learning_path(self, path_id: str) -> Optional[Dict[str, Any]]:
        for path in LEARNING_PATHS:
            if path["id"] == path_id or f"path-{path['id']}" == path_id:
                # Resolve full book objects in order
                books_in_order = []
                for bid in path["sequence"]:
                    b = self.db.get_book_by_id(bid)
                    if b:
                        books_in_order.append(b)
                return {
                    "path": path,
                    "books": books_in_order
                }
        return None

    def get_all_learning_paths(self) -> List[Dict[str, Any]]:
        result = []
        for path in LEARNING_PATHS:
            p_data = self.get_learning_path(path["id"])
            if p_data:
                result.append(p_data)
        return result
