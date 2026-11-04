/**
 * RAG-Based Semantic Recommendation Assistant Component
 */

class RAGRecommenderView {
  constructor(containerId, appState) {
    this.container = document.getElementById(containerId);
    this.appState = appState;
    this.currentQuery = "";
    this.init();
  }

  init() {
    this.renderLayout();
    this.executeSearch("Beginner-friendly artificial intelligence and deep neural networks");
  }

  renderLayout() {
    this.container.innerHTML = `
      <div class="rag-layout">
        <!-- Hero Search Section -->
        <div class="rag-hero-search">
          <div class="badge" style="background:rgba(6,182,212,0.15); color:#22d3ee; border:1px solid rgba(6,182,212,0.3);">
            ⚡ Retrieval-Augmented Generation (RAG)
          </div>
          <h2 style="font-size:1.6rem; font-weight:800; letter-spacing:-0.02em;">
            Semantic Discovery & Grounded Recommendations
          </h2>
          <p style="font-size:0.9rem; color:var(--text-muted); max-width:640px;">
            Describe your reading intent in natural prose. Our hybrid dense vector index retrieves relevant volumes 
            and synthesizes explainable recommendations grounded in actual textual excerpts.
          </p>

          <div class="rag-input-wrapper">
            <input type="text" id="rag-query-input" 
                   placeholder="e.g. A philosophical sci-fi exploring machine intelligence, free will, and civilizational control..."
                   onkeydown="if(event.key === 'Enter') window.ragView.handleSearch()" />
            <button class="btn btn-primary" onclick="window.ragView.handleSearch()">
              <span>Search Library</span> 🔍
            </button>
          </div>

          <!-- Inspiring Prompt Chips -->
          <div style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center; max-width:850px; margin-top:6px;">
            <span style="font-size:0.78rem; color:var(--text-dim); align-self:center;">Try asking:</span>
            <button class="suggestion-chip" onclick="window.ragView.runPrompt('Books exploring AI agents, alignment, and existential risk')">
              🤖 AI Alignment & Safety
            </button>
            <button class="suggestion-chip" onclick="window.ragView.runPrompt('Dystopian classics warning against surveillance and psychological control')">
              👁️ Surveillance Dystopia
            </button>
            <button class="suggestion-chip" onclick="window.ragView.runPrompt('Stoic philosophy for handling anxiety and personal resilience')">
              🏛️ Stoic Inner Calm
            </button>
            <button class="suggestion-chip" onclick="window.ragView.runPrompt('Macro-scale history of humanity and civilizational fictions')">
              🌍 Sapiens & World History
            </button>
            <button class="suggestion-chip" onclick="window.ragView.runPrompt('Large scale distributed systems and reliable data engineering')">
              💾 Distributed Data Systems
            </button>
          </div>
        </div>

        <!-- RAG Search Results Header -->
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h3 style="font-size:1.1rem; font-weight:700;" id="rag-results-heading">Synthesized Recommendations</h3>
            <div style="font-size:0.8rem; color:var(--text-dim);" id="rag-results-subheading">Querying semantic catalog...</div>
          </div>
          <div id="rag-loading-spinner" style="display:none; color:var(--accent-secondary); font-size:0.85rem;">
            <span>🔄 Vectorizing query and retrieving excerpts...</span>
          </div>
        </div>

        <!-- RAG Cards Grid -->
        <div class="rag-results-grid" id="rag-results-container">
          <!-- Dynamic cards injected here -->
        </div>
      </div>
    `;
  }

  runPrompt(text) {
    const input = document.getElementById("rag-query-input");
    if (input) input.value = text;
    this.executeSearch(text);
  }

  handleSearch() {
    const input = document.getElementById("rag-query-input");
    if (!input) return;
    const text = input.value.trim();
    if (text) {
      this.executeSearch(text);
    }
  }

  async executeSearch(query) {
    this.currentQuery = query;
    const spinner = document.getElementById("rag-loading-spinner");
    if (spinner) spinner.style.display = "block";

    try {
      const res = await fetch("/api/rag/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query, top_k: 4 })
      });
      const data = await res.json();
      if (spinner) spinner.style.display = "none";
      this.renderRecommendations(data);
    } catch (err) {
      if (spinner) spinner.style.display = "none";
      console.error("RAG search error:", err);
    }
  }

  renderRecommendations(data) {
    const container = document.getElementById("rag-results-container");
    const heading = document.getElementById("rag-results-heading");
    const subheading = document.getElementById("rag-results-subheading");

    if (!container) return;

    const recs = data.recommendations || [];
    if (heading) heading.innerText = `Found ${recs.length} Semantic Recommendations`;
    if (subheading) subheading.innerText = data.grounding_summary || `Grounded in vector similarity for: "${data.query}"`;

    if (recs.length === 0) {
      container.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--text-muted);">
          No direct recommendations found. Try broadening your keywords or prompt.
        </div>
      `;
      return;
    }

    container.innerHTML = recs.map((r, idx) => {
      const b = r.book;
      return `
        <div class="rag-card">
          <div class="rag-card-header">
            <div>
              <span class="badge" style="background:${b.cover_color}33; color:#fff; border:1px solid ${b.cover_color};">
                ${b.ddc_code}
              </span>
              <h4 style="font-size:1.05rem; font-weight:700; margin-top:8px; color:#fff;">
                ${b.title}
              </h4>
              <div style="font-size:0.82rem; color:var(--text-muted); margin-top:2px;">
                by ${b.author} (${b.year})
              </div>
            </div>
            <div class="match-gauge">
              ${r.confidence_percentage} Match
            </div>
          </div>

          <div style="font-size:0.85rem; color:#cbd5e1; line-height:1.5;">
            <strong>AI Rationale:</strong> ${r.synthesis_rationale}
          </div>

          <div class="grounded-excerpt-box">
            <div style="font-size:0.72rem; text-transform:uppercase; color:var(--accent-secondary); font-weight:700; margin-bottom:4px;">
              Grounded Text Excerpt:
            </div>
            "${r.grounded_excerpt}"
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:auto; pt-2;">
            <div style="font-size:0.78rem; color:var(--text-dim);">
              📍 Floor ${b.location.floor} • Aisle ${b.location.aisle}
            </div>
            <div style="display:flex; gap:8px;">
              <button class="btn btn-outline" style="font-size:0.75rem; padding:6px 10px;" onclick="window.appState.openComparisonWith(['${b.id}'])">
                ⚖️ Compare
              </button>
              <button class="btn btn-primary" style="font-size:0.75rem; padding:6px 12px;" onclick="window.appState.navigateToBook('${b.id}')">
                🧭 Locate
              </button>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }
}
