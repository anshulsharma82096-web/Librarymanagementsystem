/**
 * Modern AI Comparison Studio: 5-Axis Radar Chart & Feature Matrix
 */

class ComparisonStudioView {
  constructor(containerId, appState) {
    this.container = document.getElementById(containerId);
    this.appState = appState;
    this.selectedBookIds = ["lit-1984", "lit-brave-new-world"];
    this.availableBooks = [];
    this.init();
  }

  async init() {
    this.renderLayout();
    await this.loadCatalogList();
    this.fetchAndRenderComparison();
  }

  renderLayout() {
    this.container.innerHTML = `
      <div class="comparison-layout">
        <!-- Top Preset Bar & Selector -->
        <div class="comparison-selection-bar">
          <div>
            <h2 style="font-size:1.25rem; font-weight:700;">⚖️ AI Comparison Studio</h2>
            <div style="font-size:0.82rem; color:var(--text-muted); margin-top:2px;">
              Multi-dimensional analysis of literary & technical works across 5 cognitive axes
            </div>
          </div>

          <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
            <span style="font-size:0.85rem; color:var(--text-dim);">Quick Presets:</span>
            <button class="btn btn-secondary" style="font-size:0.78rem; padding:6px 12px;" onclick="window.compStudio.setPreset(['lit-1984', 'lit-brave-new-world'])">
              1984 vs Brave New World
            </button>
            <button class="btn btn-secondary" style="font-size:0.78rem; padding:6px 12px;" onclick="window.compStudio.setPreset(['cs-aima', 'cs-deep-learning'])">
              AIMA vs Deep Learning
            </button>
            <button class="btn btn-secondary" style="font-size:0.78rem; padding:6px 12px;" onclick="window.compStudio.setPreset(['lit-dune', 'lit-foundation'])">
              Dune vs Foundation
            </button>
            <button class="btn btn-secondary" style="font-size:0.78rem; padding:6px 12px;" onclick="window.compStudio.setPreset(['phil-meditations', 'phil-thinking-fast-slow'])">
              Meditations vs Kahneman
            </button>
          </div>
        </div>

        <!-- Book Selection Dropdowns Row -->
        <div class="card" style="padding:16px 20px; display:flex; align-items:center; gap:16px; flex-wrap:wrap;">
          <div style="display:flex; align-items:center; gap:8px;">
            <label style="font-size:0.85rem; font-weight:600; color:var(--text-muted);">Book 1:</label>
            <select id="comp-select-1" class="filter-select" onchange="window.compStudio.handleSelectChange(0, this.value)"></select>
          </div>
          <div style="font-size:1.1rem; color:var(--text-dim); font-weight:bold;">VS</div>
          <div style="display:flex; align-items:center; gap:8px;">
            <label style="font-size:0.85rem; font-weight:600; color:var(--text-muted);">Book 2:</label>
            <select id="comp-select-2" class="filter-select" onchange="window.compStudio.handleSelectChange(1, this.value)"></select>
          </div>
          <button class="btn btn-primary" onclick="window.compStudio.fetchAndRenderComparison()">
            Analyze Comparison
          </button>
        </div>

        <!-- AI Verdict Banner -->
        <div id="comp-verdict-banner" class="card" style="display:none; background:linear-gradient(135deg, rgba(99,102,241,0.12), rgba(6,182,212,0.12)); border-color:rgba(99,102,241,0.3);">
          <div style="display:flex; align-items:flex-start; gap:16px;">
            <div style="font-size:28px;">💡</div>
            <div style="flex:1;">
              <h3 style="font-size:1.05rem; font-weight:700; color:#ffffff;" id="comp-verdict-title">AI Synthesis & Sequence Verdict</h3>
              <p style="font-size:0.88rem; color:#e2e8f0; line-height:1.6; margin-top:6px;" id="comp-verdict-text"></p>
              <div style="margin-top:10px; font-size:0.85rem; font-weight:600; color:#38bdf8;" id="comp-verdict-rec"></div>
            </div>
          </div>
        </div>

        <!-- Main Comparative Grid: Radar + Matrix -->
        <div class="comparison-grid">
          <!-- 5-Axis Radar Chart Card -->
          <div class="radar-card">
            <h3 style="font-size:1rem; font-weight:700; margin-bottom:12px;">📊 5-Axis Cognitive Radar</h3>
            <svg id="comp-radar-svg" class="radar-svg" viewBox="0 0 400 380"></svg>
            <div id="comp-radar-legend" style="display:flex; gap:16px; margin-top:14px; flex-wrap:wrap; justify-content:center;"></div>
          </div>

          <!-- Feature Matrix Card -->
          <div class="card" style="padding:0; overflow:hidden;">
            <table class="comparison-table" id="comp-matrix-table">
              <thead>
                <tr id="comp-table-header">
                  <th>Dimension</th>
                  <th>Book 1</th>
                  <th>Book 2</th>
                </tr>
              </thead>
              <tbody id="comp-table-body">
                <!-- Injected dynamically -->
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  async loadCatalogList() {
    try {
      const res = await fetch("/api/books");
      const data = await res.json();
      this.availableBooks = data.books || [];

      const s1 = document.getElementById("comp-select-1");
      const s2 = document.getElementById("comp-select-2");

      if (s1 && s2) {
        const optionsHtml = this.availableBooks.map(b => `<option value="${b.id}">${b.title} (${b.author})</option>`).join("");
        s1.innerHTML = optionsHtml;
        s2.innerHTML = optionsHtml;

        s1.value = this.selectedBookIds[0];
        s2.value = this.selectedBookIds[1];
      }
    } catch (err) {
      console.error("Failed to load catalog list for comparison:", err);
    }
  }

  setPreset(bookIds) {
    this.selectedBookIds = bookIds;
    const s1 = document.getElementById("comp-select-1");
    const s2 = document.getElementById("comp-select-2");
    if (s1 && s2) {
      s1.value = bookIds[0];
      s2.value = bookIds[1];
    }
    this.fetchAndRenderComparison();
  }

  handleSelectChange(index, value) {
    this.selectedBookIds[index] = value;
  }

  async fetchAndRenderComparison() {
    try {
      const res = await fetch("/api/comparison", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book_ids: this.selectedBookIds })
      });
      const data = await res.json();
      if (data.error) {
        window.appState.showToast(data.error);
        return;
      }
      this.renderComparisonResult(data);
    } catch (err) {
      console.error("Comparison request failed:", err);
    }
  }

  renderComparisonResult(data) {
    const books = data.books;
    const dimensions = data.dimensions;
    const radarSeries = data.radar_series;
    const verdict = data.ai_verdict;

    // 1. Verdict Banner
    const banner = document.getElementById("comp-verdict-banner");
    if (banner && verdict) {
      banner.style.display = "block";
      document.getElementById("comp-verdict-title").innerText = verdict.reading_pairing || "Comparative Analysis";
      document.getElementById("comp-verdict-text").innerText = verdict.summary;
      document.getElementById("comp-verdict-rec").innerText = `🎯 Recommendation: ${verdict.recommended_sequence}`;
    }

    // 2. Render SVG Radar Chart
    this.drawRadarChart(dimensions, radarSeries);

    // 3. Render Matrix Table
    this.drawMatrixTable(books, data.comparison_matrix);
  }

  drawRadarChart(dimensions, series) {
    const svg = document.getElementById("comp-radar-svg");
    const legend = document.getElementById("comp-radar-legend");
    if (!svg) return;

    const centerX = 200;
    const centerY = 180;
    const maxRadius = 120;
    const numAxes = dimensions.length;

    let html = `
      <!-- Concentric Web Rings -->
      ${[0.2, 0.4, 0.6, 0.8, 1.0].map(ratio => {
        const r = maxRadius * ratio;
        const pts = [];
        for (let i = 0; i < numAxes; i++) {
          const angle = (Math.PI * 2 / numAxes) * i - Math.PI / 2;
          pts.push(`${centerX + r * Math.cos(angle)},${centerY + r * Math.sin(angle)}`);
        }
        return `
          <polygon points="${pts.join(' ')}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
          <text x="${centerX + 6}" y="${centerY - r + 12}" fill="rgba(255,255,255,0.2)" font-size="9">${ratio * 10}</text>
        `;
      }).join("")}

      <!-- Radial Spoke Axes -->
      ${dimensions.map((dim, i) => {
        const angle = (Math.PI * 2 / numAxes) * i - Math.PI / 2;
        const x2 = centerX + maxRadius * Math.cos(angle);
        const y2 = centerY + maxRadius * Math.sin(angle);
        const labelX = centerX + (maxRadius + 28) * Math.cos(angle);
        const labelY = centerY + (maxRadius + 22) * Math.sin(angle);
        return `
          <line x1="${centerX}" y1="${centerY}" x2="${x2}" y2="${y2}" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
          <text x="${labelX}" y="${labelY}" text-anchor="middle" fill="#94a3b8" font-size="10" font-weight="600">
            ${dim.label}
          </text>
        `;
      }).join("")}
    `;

    // Render Data Polygons
    const colors = ["#6366f1", "#06b6d4", "#ec4899", "#10b981"];
    let legendHtml = "";

    series.forEach((s, sIdx) => {
      const color = colors[sIdx % colors.length];
      const pts = [];

      s.values.forEach((val, i) => {
        const angle = (Math.PI * 2 / numAxes) * i - Math.PI / 2;
        const r = (val / 10.0) * maxRadius;
        pts.push(`${centerX + r * Math.cos(angle)},${centerY + r * Math.sin(angle)}`);
      });

      html += `
        <polygon points="${pts.join(' ')}" fill="${color}" fill-opacity="0.25" stroke="${color}" stroke-width="2.5" />
      `;

      legendHtml += `
        <div style="display:flex; align-items:center; gap:8px; font-size:0.85rem; font-weight:600;">
          <span style="width:12px; height:12px; border-radius:3px; background:${color};"></span>
          <span>${s.title}</span>
        </div>
      `;
    });

    svg.innerHTML = html;
    if (legend) legend.innerHTML = legendHtml;
  }

  drawMatrixTable(books, matrix) {
    const thead = document.getElementById("comp-table-header");
    const tbody = document.getElementById("comp-table-body");
    if (!thead || !tbody) return;

    thead.innerHTML = `
      <th style="width:24%;">Feature Dimension</th>
      ${books.map(b => `
        <th>
          <div style="font-weight:700; color:#fff;">${b.title}</div>
          <div style="font-size:0.75rem; color:var(--text-dim); margin-top:2px;">${b.author}</div>
          <button class="btn btn-outline" style="margin-top:6px; padding:4px 8px; font-size:0.72rem;" onclick="window.appState.navigateToBook('${b.id}')">
            📍 Locate on Map
          </button>
        </th>
      `).join("")}
    `;

    let rowsHtml = "";
    matrix.forEach(row => {
      rowsHtml += `
        <tr>
          <td style="font-weight:600; color:#94a3b8; background:rgba(15,23,42,0.4);">
            ${row.dimension}
          </td>
          ${books.map(b => {
            const itemObj = (row.items || []).find(it => it[b.id]);
            const val = itemObj ? itemObj[b.id] : "--";
            return `<td>${val}</td>`;
          }).join("")}
        </tr>
      `;
    });

    tbody.innerHTML = rowsHtml;
  }
}
