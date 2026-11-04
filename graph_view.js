/**
 * Interactive Knowledge Graph Explorer (Ontology & Concept Network)
 */

class KnowledgeGraphView {
  constructor(containerId, appState) {
    this.container = document.getElementById(containerId);
    this.appState = appState;
    this.graphData = null;
    this.selectedNode = null;
    this.filterType = "all";
    this.init();
  }

  async init() {
    this.renderLayout();
    await this.loadGraphData();
  }

  renderLayout() {
    this.container.innerHTML = `
      <div class="kg-layout">
        <!-- Main Graph Canvas -->
        <div class="kg-canvas-container">
          <div class="map-toolbar">
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="font-size:0.85rem; font-weight:700;">Filter Nodes:</span>
              <button class="btn btn-secondary" style="font-size:0.75rem; padding:4px 10px;" onclick="window.kgView.setFilter('all')">All</button>
              <button class="btn btn-secondary" style="font-size:0.75rem; padding:4px 10px;" onclick="window.kgView.setFilter('book')">Books</button>
              <button class="btn btn-secondary" style="font-size:0.75rem; padding:4px 10px;" onclick="window.kgView.setFilter('subject')">Subjects (DDC)</button>
              <button class="btn btn-secondary" style="font-size:0.75rem; padding:4px 10px;" onclick="window.kgView.setFilter('concept')">Concepts</button>
              <button class="btn btn-secondary" style="font-size:0.75rem; padding:4px 10px;" onclick="window.kgView.setFilter('learning_path')">Roadmaps</button>
            </div>
            <div style="font-size:0.78rem; color:var(--text-dim);" id="kg-stats-pill">
              Loading nodes & relations...
            </div>
          </div>

          <svg id="kg-network-svg" class="map-svg-canvas" viewBox="0 0 1000 650" preserveAspectRatio="xMidYMid meet">
            <!-- Dynamic Graph Rendered here -->
          </svg>
        </div>

        <!-- Node Inspector Sidebar -->
        <div class="kg-sidebar">
          <div class="card" id="kg-inspector-card">
            <div style="font-size:0.75rem; text-transform:uppercase; color:var(--accent-secondary); font-weight:700;">
              Knowledge Inspector
            </div>
            <h3 style="font-size:1.15rem; font-weight:700; margin-top:6px;" id="kg-inspect-title">
              Select any entity
            </h3>
            <div id="kg-inspect-type-badge" class="badge" style="margin-top:6px; background:rgba(255,255,255,0.08); color:var(--text-main);">
              Interactive Explorer
            </div>

            <div id="kg-inspect-content" style="margin-top:14px; font-size:0.85rem; color:#cbd5e1; line-height:1.5;">
              Click on books, subject classifications, or concepts to inspect conceptual relationships, prerequisites, and reading order.
            </div>

            <div id="kg-inspect-actions" style="margin-top:16px; display:none; gap:10px; flex-direction:column;">
              <!-- Dynamic buttons -->
            </div>
          </div>

          <!-- Curated Learning Paths Preview -->
          <div class="card" style="padding:16px;">
            <div style="font-size:0.85rem; font-weight:700; color:#fff; margin-bottom:8px;">
              🎓 Curated Learning Roadmaps
            </div>
            <div style="display:flex; flex-direction:column; gap:8px;" id="kg-path-list">
              <!-- Pathways injected here -->
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async loadGraphData() {
    try {
      const res = await fetch("/api/knowledge-graph");
      const data = await res.json();
      this.graphData = data;
      document.getElementById("kg-stats-pill").innerText = `${data.stats.total_nodes} Entities • ${data.stats.total_edges} Semantic Connections`;
      this.renderGraph();
      this.renderPathways();
    } catch (err) {
      console.error("Failed to load knowledge graph:", err);
    }
  }

  setFilter(type) {
    this.filterType = type;
    this.renderGraph();
  }

  renderGraph() {
    if (!this.graphData) return;
    const svg = document.getElementById("kg-network-svg");
    if (!svg) return;

    let nodes = this.graphData.nodes;
    if (this.filterType !== "all") {
      nodes = nodes.filter(n => n.type === this.filterType);
    }

    const nodeIds = new Set(nodes.map(n => n.id));
    const edges = this.graphData.edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target));

    // Calculate layout positions using an aesthetic clustered orbital layout
    const width = 1000;
    const height = 650;
    const center = { x: width / 2, y: height / 2 };

    // Group nodes by type
    const subjects = nodes.filter(n => n.type === "subject");
    const paths = nodes.filter(n => n.type === "learning_path");
    const concepts = nodes.filter(n => n.type === "concept");
    const books = nodes.filter(n => n.type === "book");
    const authors = nodes.filter(n => n.type === "author");

    const positions = {};

    // Center hub: Learning paths in inner orbital ring
    paths.forEach((p, idx) => {
      const angle = (idx / Math.max(paths.length, 1)) * 2 * Math.PI;
      positions[p.id] = {
        x: center.x + 90 * Math.cos(angle),
        y: center.y + 90 * Math.sin(angle)
      };
    });

    // Subject Hubs in middle orbital ring
    subjects.forEach((s, idx) => {
      const angle = (idx / Math.max(subjects.length, 1)) * 2 * Math.PI - Math.PI / 4;
      positions[s.id] = {
        x: center.x + 230 * Math.cos(angle),
        y: center.y + 200 * Math.sin(angle)
      };
    });

    // Concepts in outer scattered orbit
    concepts.forEach((c, idx) => {
      const angle = (idx / Math.max(concepts.length, 1)) * 2 * Math.PI + 0.3;
      positions[c.id] = {
        x: center.x + 340 * Math.cos(angle),
        y: center.y + 260 * Math.sin(angle)
      };
    });

    // Books clustered near their subjects
    books.forEach((b, idx) => {
      // Find edge to subject
      const edge = this.graphData.edges.find(e => e.source === b.id && e.relation === "BELONGS_TO_SUBJECT");
      let basePos = center;
      if (edge && positions[edge.target]) {
        basePos = positions[edge.target];
      }
      const angle = (idx * 1.37) % (2 * Math.PI);
      const r = 70 + (idx % 3) * 20;
      positions[b.id] = {
        x: Math.min(width - 40, Math.max(40, basePos.x + r * Math.cos(angle))),
        y: Math.min(height - 40, Math.max(40, basePos.y + r * Math.sin(angle)))
      };
    });

    // Authors outer perimeter
    authors.forEach((a, idx) => {
      const angle = (idx / Math.max(authors.length, 1)) * 2 * Math.PI;
      positions[a.id] = {
        x: center.x + 440 * Math.cos(angle),
        y: center.y + 290 * Math.sin(angle)
      };
    });

    let html = `
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(255,255,255,0.3)"/>
        </marker>
      </defs>

      <!-- Edges -->
      <g class="kg-edges-layer">
        ${edges.map(e => {
          const p1 = positions[e.source];
          const p2 = positions[e.target];
          if (!p1 || !p2) return "";
          const isPrereq = e.relation === "PREREQUISITE_FOR";
          return `
            <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" 
                  stroke="${isPrereq ? '#f59e0b' : 'rgba(255,255,255,0.1)'}" 
                  stroke-width="${isPrereq ? 2 : 1}" 
                  stroke-dasharray="${isPrereq ? '4,4' : 'none'}"
                  marker-end="${isPrereq ? 'url(#arrow)' : ''}" />
          `;
        }).join("")}
      </g>

      <!-- Nodes -->
      <g class="kg-nodes-layer">
        ${nodes.map(n => {
          const pos = positions[n.id] || center;
          const r = n.size || 18;
          return `
            <g class="kg-node" transform="translate(${pos.x}, ${pos.y})" style="cursor:pointer;" onclick="window.kgView.inspectNode('${n.id}')">
              <circle r="${r}" fill="${n.color || '#6366f1'}" stroke="#ffffff" stroke-width="2" opacity="0.9" />
              <text y="${r + 14}" text-anchor="middle" fill="#cbd5e1" font-size="10" font-weight="600" style="pointer-events:none; text-shadow:0 1px 3px #000;">
                ${this.truncate(n.label, 18)}
              </text>
            </g>
          `;
        }).join("")}
      </g>
    `;

    svg.innerHTML = html;
  }

  inspectNode(nodeId) {
    if (!this.graphData) return;
    const node = this.graphData.nodes.find(n => n.id === nodeId);
    if (!node) return;

    this.selectedNode = node;
    document.getElementById("kg-inspect-title").innerText = node.label;
    
    const badge = document.getElementById("kg-inspect-type-badge");
    badge.innerText = node.type.toUpperCase();
    badge.style.background = node.color ? `${node.color}33` : "rgba(255,255,255,0.1)";
    badge.style.color = "#ffffff";
    badge.style.borderColor = node.color || "#fff";

    const content = document.getElementById("kg-inspect-content");
    const actions = document.getElementById("kg-inspect-actions");

    if (node.type === "book") {
      content.innerHTML = `
        <div><strong>Author:</strong> ${node.author} (${node.year})</div>
        <div style="margin-top:4px;"><strong>Call Number:</strong> <code>${node.ddc}</code></div>
        <div style="margin-top:4px;"><strong>Physical Stack:</strong> Floor ${node.floor}, Aisle ${node.aisle} (${node.shelf})</div>
        <div style="margin-top:4px;"><strong>Rating:</strong> ⭐ ${node.rating} / 5.0</div>
      `;
      actions.style.display = "flex";
      actions.innerHTML = `
        <button class="btn btn-primary" onclick="window.appState.navigateToBook('${node.id}')">
          🧭 Navigate to Shelf
        </button>
        <button class="btn btn-secondary" onclick="window.appState.openComparisonWith(['${node.id}'])">
          ⚖️ Add to Comparison
        </button>
      `;
    } else if (node.type === "learning_path") {
      content.innerHTML = `
        <div><strong>Description:</strong> ${node.description}</div>
        <div style="margin-top:6px;"><strong>Difficulty:</strong> ${node.difficulty}</div>
      `;
      actions.style.display = "flex";
      actions.innerHTML = `
        <button class="btn btn-primary" onclick="window.kgView.highlightPathway('${node.id}')">
          Highlight Path Sequence
        </button>
      `;
    } else {
      content.innerHTML = `
        <div>${node.description || "Core subject/thematic ontology node in the library graph."}</div>
      `;
      actions.style.display = "none";
    }
  }

  async renderPathways() {
    try {
      const res = await fetch("/api/learning-paths");
      const data = await res.json();
      const list = document.getElementById("kg-path-list");
      if (!list) return;

      list.innerHTML = (data.learning_paths || []).map(p => `
        <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:10px; cursor:pointer;" onclick="window.kgView.highlightPathway('path-${p.path.id}')">
          <div style="font-weight:700; font-size:0.85rem; color:#fff;">${p.path.name}</div>
          <div style="font-size:0.75rem; color:var(--text-dim); margin-top:2px;">${p.books.length} Books • ${p.path.difficulty}</div>
        </div>
      `).join("");
    } catch (err) {
      console.error("Error loading learning paths:", err);
    }
  }

  highlightPathway(pathId) {
    this.inspectNode(pathId);
    window.appState.showToast(`Active learning sequence highlighted.`);
  }

  truncate(str, max) {
    return str.length > max ? str.substring(0, max - 1) + "…" : str;
  }
}
