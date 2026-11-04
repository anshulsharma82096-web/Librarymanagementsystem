# 🏛️ Alexandria AI: Library Book Recommendation & Navigation System

[![CI Build](https://github.com/alexandria-ai/library-ai-navigator/actions/workflows/ci.yml/badge.svg)](https://github.com/alexandria-ai/library-ai-navigator/actions)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![Docker](https://img.shields.io/badge/docker-ready-cyan.svg)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An intelligent, full-stack library discovery platform combining multidimensional **knowledge representation**, **search-based physical navigation**, an **intelligent conversational librarian agent**, **modern multi-book AI comparison**, and **Retrieval-Augmented Generation (RAG)** recommendations.

---

## 🌟 Key Subsystems & Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ALEXANDRIA AI PLATFORM                          │
├────────────────────────────────┬───────────────────────────────────────┤
│ 🗺️ Search-Based Navigation     │  • Multi-floor library stack modeling  │
│    (A* Pathfinding Mesh)       │  • Turn-by-turn physical directions   │
│                                │  • 3D vertical shelf tier locator     │
├────────────────────────────────┼───────────────────────────────────────┤
│ 💬 Intelligent Librarian       │  • Agent 'Athena' (Multi-turn LLM)    │
│    (Conversational Agent)      │  • Automated tool dispatching         │
│                                │  • Hold & reservation management      │
├────────────────────────────────┼───────────────────────────────────────┤
│ 🔍 RAG Recommendation Engine   │  • TF-IDF + Dense semantic embeddings │
│    (Hybrid Retrieval)          │  • Cosine similarity ranking          │
│                                │  • Context-grounded textual excerpts  │
├────────────────────────────────┼───────────────────────────────────────┤
│ ⚖️ AI Comparison Studio        │  • 5-Axis interactive SVG radar chart │
│    (Multi-Book Analysis)       │  • Thematic contrast matrix & verdict │
├────────────────────────────────┼───────────────────────────────────────┤
│ 🕸️ Knowledge Representation    │  • Dewey Decimal (DDC) taxonomy       │
│    (Ontology & Learning Paths) │  • Concept & prerequisite network     │
└────────────────────────────────┴───────────────────────────────────────┘
```

---

## 🚀 Quick Start

### 1. Requirements
- Python 3.8+ (comes with standard library + `numpy`)
- Any modern web browser

### 2. Launching the Platform
Run the launcher from the project directory:

```bash
python run.py 8000
```

Open your browser to:
```
http://127.0.0.1:8000
```

---

## 🧭 Deep Dive into the 5 Pillars

### 1. Knowledge Representation of Books & Subjects
- **Taxonomy**: Hierarchical mapping adhering to the **Dewey Decimal Classification (DDC)** system (`000` Computer Science, `100` Philosophy, `300` Social Sciences, `500` Natural Sciences, `800` Literature, `900` History).
- **Ontology Graph**: 70+ entities connected by typed relations:
  - `BELONGS_TO_SUBJECT`: Book $\rightarrow$ DDC Class
  - `AUTHORED_BY`: Book $\rightarrow$ Author
  - `EXPLORES_CONCEPT`: Book $\rightarrow$ Cognitive / Philosophical Concept
  - `PREREQUISITE_FOR`: Book A $\rightarrow$ Book B (directed dependency chain)
  - `IN_LEARNING_PATH`: Curated pedagogical reading sequences (e.g., *AI Foundations*, *Dystopian Power*, *Speculative Sociology*, *Architecture of Mind*).

### 2. Search-Based Navigation & A* Routing
- **Physical Stacks Topology**: 2 detailed library floors modeled with coordinates:
  - **Floor 1 (Grand Atrium & Sci-Tech Pavilion)**: Natural Sciences (Aisles A1-A4), Computer Science & AI (Aisles B1-B4), Kiosks, Circulation Desk, Grand Staircase.
  - **Floor 2 (Humanities & Philosophy Mezzanine)**: Literature & Cyberpunk (Aisles C1-C4), Philosophy & Stoicism (Aisles D1-D4), World History (Aisles E1-E4).
- **A* Pathfinding Mesh**:
  - Traversal heuristic with Euclidean distance metric $h(n) = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$.
  - Seamless inter-floor routing via elevator/stairs transitions.
- **Shelf Unit Elevation Locator**:
  - Highlights the vertical tier (Tier 1: Bottom, Tier 2: Lower-Mid, Tier 3: Eye Level, Tier 4: Top) so the patron knows exactly which plank the volume rests upon.

### 3. Intelligent Librarian Agent ("Athena")
- **Multi-Turn Contextual Intent Recognition**:
  - `LOCATE_BOOK`: Dispatches spatial navigation query and draws route.
  - `COMPARE_BOOKS`: Pulls books into the 5-axis comparison studio.
  - `EXPLORE_LEARNING_PATH`: Synthesizes ordered curriculum for any topic.
  - `EXPLAIN_CLASSIFICATION`: Decodes DDC numbers and spatial wings.
  - `RESERVE_BOOK`: Updates SQLite inventory and issues a hold locker pass.
- **Rich Interactive UI Cards**:
  - Interactive "Open Map & Follow Trail", "Compare", and "Reserve" action buttons embedded right inside dialogue bubbles.

### 4. Modern AI Comparison Studio
- **5-Axis Cognitive Radar Metrics**:
  - *Complexity & Rigor* ($1-10$)
  - *Narrative Pacing & Readability* ($1-10$)
  - *Theoretical Depth* ($1-10$)
  - *Practical Utility* ($1-10$)
  - *Thematic Gravitas* ($1-10$)
- **Side-by-Side Matrix**:
  - Contrast of Core Thesis, Writing Style, Ideal Reader Persona, and Physical Stack Proximity.
  - Synthesized AI verdict recommending which book to read first based on reader goals.

### 5. RAG-Based Recommendation Assistant
- **Hybrid Semantic Indexing**:
  - Sublinear TF-IDF + BM25 term weighting with bigram extraction.
  - Dense cosine similarity ranking against user natural language prompts.
- **Context-Grounded Excerpts**:
  - Every recommendation highlights a direct cited excerpt from the book text to ground the suggestion.
  - Explains the exact rationale behind why the book fits the reader's inquiry.

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/books` | Search catalog (`?q=...&category=...&floor=...`) |
| `GET` | `/api/books/<id>` | Retrieve complete book metadata & coordinates |
| `GET` | `/api/taxonomy` | Dewey Decimal classes & categories |
| `GET` | `/api/knowledge-graph` | Full ontology nodes & edges (`?book_id=...` for ego-network) |
| `GET` | `/api/learning-paths` | All curated sequential reading roadmaps |
| `GET` | `/api/navigation/floors/<n>` | Layout coordinates for Floor 1 or 2 |
| `POST` | `/api/navigation/route` | Generate A* pathfinding waypoints & turn-by-turn steps |
| `POST` | `/api/rag/recommend` | Semantic RAG search with grounded excerpts |
| `POST` | `/api/comparison` | 5-Axis radar metrics & comparative feature matrix |
| `POST` | `/api/librarian/chat` | Conversational Athena assistant with tool invocation |
| `POST` | `/api/books/<id>/reserve` | Reserve physical copy at automated hold station |

---

## 📁 Project Directory Structure

```
library-ai-navigator/
├── backend/
│   ├── app.py                 # Multi-threaded HTTP Server & REST API Router
│   ├── database.py            # SQLite database with Dewey Decimal catalog & holds
│   ├── seed_data.py           # Curated library catalog with coordinates & metrics
│   ├── knowledge_graph.py     # Ontology builder, concepts, and reading sequences
│   ├── navigation_engine.py   # Multi-floor A* pathfinding & turn-by-turn directions
│   ├── librarian_agent.py     # Conversational AI 'Athena' with intent dispatch
│   ├── rag_engine.py          # Semantic vectorizer & context-grounded recommender
│   ├── comparison_engine.py   # 5-axis radar metrics & contrast synthesizer
│   └── test_backend.py        # Complete automated test suite
├── frontend/
│   ├── index.html             # Single-Page Application interface
│   ├── styles.css             # Glassmorphism dark theme & animations
│   ├── app.js                 # Global application state & controller
│   └── components/
│       ├── map_view.js        # Interactive SVG floor map & animated A* path
│       ├── librarian_chat.js  # Conversational Athena chat with action cards
│       ├── comparison_view.js # Interactive SVG radar chart & matrix
│       ├── rag_view.js        # Natural language semantic query assistant
│       ├── graph_view.js      # Visual knowledge graph with orbital layouts
│       └── catalog_view.js    # Filterable book catalog with Dewey badges
├── run.py                     # One-click platform launcher
├── requirements.txt           # Python dependency specification
├── Dockerfile                 # Container image specification
├── docker-compose.yml         # Container runner config
├── render.yaml                # 1-Click Cloud deployment blueprint
├── deploy_to_github.bat       # Windows deployment helper script
└── README.md                  # Documentation
```

---

## 🚢 Deploying to GitHub & The Cloud

### Step 1: Create a New GitHub Repository
1. Visit [GitHub New Repository](https://github.com/new).
2. Set repository name (e.g., `alexandria-library-ai`).
3. Set visibility to **Public** (or Private).
4. **Important**: Leave "Add a README", "Add .gitignore", and "Choose a license" **UNCHECKED** (we have already created and configured all of them).
5. Click **Create repository**.

### Step 2: Push Local Code to GitHub

#### Option A: Using the Automated Windows Script
Double-click [`deploy_to_github.bat`](file:///C:/Users/anshul%20sharma/.gemini/antigravity/scratch/library-ai-navigator/deploy_to_github.bat) and paste your repository URL.

#### Option B: Using Git Terminal
```bash
cd "C:\Users\anshul sharma\.gemini\antigravity\scratch\library-ai-navigator"
git init
git add .
git commit -m "Initial commit: Alexandria AI platform"
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/alexandria-library-ai.git
git push -u origin main
```

#### Option C: Using GitHub Desktop
1. Open [GitHub Desktop](https://desktop.github.com/).
2. Click **File** > **Add Local Repository...** and select `C:\Users\anshul sharma\.gemini\antigravity\scratch\library-ai-navigator`.
3. Click **Publish repository** to push it directly to your GitHub account.

---

### Step 3: Deploy Live on the Web (Free Hosting)

#### Option 1: Instant Web Deployment via GitHub Pages (Free, Zero Setup)
The repository includes an automatic GitHub Actions workflow [`.github/workflows/deploy-pages.yml`](file:///C:/Users/anshul%20sharma/.gemini/antigravity/scratch/library-ai-navigator/.github/workflows/deploy-pages.yml) and an in-browser client engine [`frontend/local_engine.js`](file:///C:/Users/anshul%20sharma/.gemini/antigravity/scratch/library-ai-navigator/frontend/local_engine.js):
1. In your GitHub repository, click **Settings** > **Pages** (left sidebar).
2. Under **Build and deployment** > **Source**, select **GitHub Actions**.
3. Push to `main` (or run the workflow manually from the **Actions** tab).
4. Your application will be live at:
   ```
   https://<your-username>.github.io/<your-repo-name>/
   ```
   All interactive floor maps, A* pathfinding, RAG semantic recommendations, 5-axis radar charts, and Athena librarian chat run seamlessly right in any web browser!

#### Option 2: Full-Stack Python Cloud Hosting on Render (Free)
1. Sign up on [Render.com](https://render.com/).
2. Click **New +** > **Web Service**.
3. Connect your GitHub repository `alexandria-library-ai`.
4. Render automatically detects [`render.yaml`](file:///C:/Users/anshul%20sharma/.gemini/antigravity/scratch/library-ai-navigator/render.yaml) and deploys your full-stack app with a public HTTPS URL.

#### Option 3: Deploy with Docker
```bash
docker-compose up --build
```
Your containerized app will be available on `http://localhost:8000`.
