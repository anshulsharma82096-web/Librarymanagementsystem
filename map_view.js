/**
 * Interactive SVG 2D Library Map & A* Navigation Visualizer
 */

class LibraryMapView {
  constructor(containerId, appState) {
    this.container = document.getElementById(containerId);
    this.appState = appState;
    this.currentFloor = 1;
    this.activeRoute = null;
    this.selectedShelf = null;
    this.init();
  }

  init() {
    this.renderLayout();
    this.loadFloor(1);
  }

  renderLayout() {
    this.container.innerHTML = `
      <div class="map-layout">
        <!-- Main Map Viewport -->
        <div class="map-viewport-container">
          <div class="map-toolbar">
            <div class="floor-switcher">
              <button class="floor-btn active" id="btn-floor-1" onclick="window.mapView.switchFloor(1)">
                🏢 Floor 1: Sci-Tech & CS
              </button>
              <button class="floor-btn" id="btn-floor-2" onclick="window.mapView.switchFloor(2)">
                🏛️ Floor 2: Humanities & Lit
              </button>
            </div>

            <div class="map-legend">
              <div class="legend-item"><span class="legend-dot" style="background:#2563eb"></span> CS & AI Stacks</div>
              <div class="legend-item"><span class="legend-dot" style="background:#0284c7"></span> Physics & Math</div>
              <div class="legend-item"><span class="legend-dot" style="background:#ea580c"></span> Literature Wing</div>
              <div class="legend-item"><span class="legend-dot" style="background:#7c3aed"></span> Philosophy</div>
              <div class="legend-item"><span class="legend-dot" style="background:#10b981"></span> Waypoints</div>
            </div>
          </div>

          <svg id="library-floor-svg" class="map-svg-canvas" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet">
            <!-- Dynamic SVG elements rendered here -->
          </svg>
        </div>

        <!-- Sidebar Navigation & Shelf HUD -->
        <div class="map-sidebar">
          <div class="card" id="nav-hud-card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <h3 style="font-size:1.05rem; font-weight:700; display:flex; align-items:center; gap:8px;">
                <span>🧭</span> Navigation Guidance
              </h3>
              <span id="nav-status-badge" class="badge" style="background:rgba(99,102,241,0.2); color:#818cf8;">
                Standby Kiosk
              </span>
            </div>

            <div id="nav-book-summary" style="margin-bottom:14px; font-size:0.88rem; color:var(--text-muted);">
              Select any book from the catalog or ask Librarian Athena to compute a walking route.
            </div>

            <div id="nav-stats-row" style="display:none; gap:10px; margin-bottom:16px;">
              <div style="flex:1; background:rgba(255,255,255,0.04); padding:10px; border-radius:var(--radius-sm); border:1px solid var(--border-color); text-align:center;">
                <div style="font-size:0.75rem; color:var(--text-dim); text-transform:uppercase;">Distance</div>
                <div id="nav-stat-dist" style="font-size:1.15rem; font-weight:700; color:#38bdf8;">-- m</div>
              </div>
              <div style="flex:1; background:rgba(255,255,255,0.04); padding:10px; border-radius:var(--radius-sm); border:1px solid var(--border-color); text-align:center;">
                <div style="font-size:0.75rem; color:var(--text-dim); text-transform:uppercase;">Est. Walk</div>
                <div id="nav-stat-time" style="font-size:1.15rem; font-weight:700; color:#34d399;">-- s</div>
              </div>
              <div style="flex:1; background:rgba(255,255,255,0.04); padding:10px; border-radius:var(--radius-sm); border:1px solid var(--border-color); text-align:center;">
                <div style="font-size:0.75rem; color:var(--text-dim); text-transform:uppercase;">Floor</div>
                <div id="nav-stat-floor" style="font-size:1.15rem; font-weight:700; color:#f472b6;">Floor 1</div>
              </div>
            </div>

            <div id="nav-steps-container" style="display:none; max-height:180px; overflow-y:auto; font-size:0.82rem; margin-bottom:14px;">
              <ol id="nav-steps-list" style="padding-left:18px; line-height:1.6; color:#cbd5e1;"></ol>
            </div>
          </div>

          <!-- 3D Shelf Unit Elevation View -->
          <div class="shelf-elevation-card" id="shelf-elevation-view">
            <h4 style="font-size:0.92rem; font-weight:700; display:flex; align-items:center; gap:8px;">
              <span>📚</span> Shelf Unit Elevation (Eye-Level View)
            </h4>
            <div style="font-size:0.78rem; color:var(--text-dim); margin-top:4px;">
              Physical vertical tier locator within the stack
            </div>

            <div class="shelf-tiers-container">
              <div class="shelf-tier-slot" id="tier-slot-4">
                <div>
                  <div style="font-weight:600;">Tier 4: Top Shelf</div>
                  <div style="font-size:0.72rem; color:var(--text-dim);">Height: ~190 cm • Archival / Oversized</div>
                </div>
                <span class="tier-status">--</span>
              </div>
              <div class="shelf-tier-slot" id="tier-slot-3">
                <div>
                  <div style="font-weight:600;">Tier 3: Eye Level (Optimal Access)</div>
                  <div style="font-size:0.72rem; color:var(--text-dim);">Height: ~140 cm • Primary Circulation</div>
                </div>
                <span class="tier-status">--</span>
              </div>
              <div class="shelf-tier-slot" id="tier-slot-2">
                <div>
                  <div style="font-weight:600;">Tier 2: Lower-Mid Shelf</div>
                  <div style="font-size:0.72rem; color:var(--text-dim);">Height: ~80 cm • Standard Classification</div>
                </div>
                <span class="tier-status">--</span>
              </div>
              <div class="shelf-tier-slot" id="tier-slot-1">
                <div>
                  <div style="font-weight:600;">Tier 1: Bottom Shelf</div>
                  <div style="font-size:0.72rem; color:var(--text-dim);">Height: ~30 cm • Bound Serials & Reference</div>
                </div>
                <span class="tier-status">--</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  switchFloor(floorNum) {
    this.currentFloor = floorNum;
    document.getElementById("btn-floor-1").classList.toggle("active", floorNum === 1);
    document.getElementById("btn-floor-2").classList.toggle("active", floorNum === 2);
    this.loadFloor(floorNum);
    if (this.activeRoute) {
      this.drawRouteOnSvg(this.activeRoute);
    }
  }

  async loadFloor(floorNum) {
    try {
      const res = await fetch(`/api/navigation/floors/${floorNum}`);
      const data = await res.json();
      this.renderSvgFloorPlan(data);
    } catch (err) {
      console.error("Failed to load floor details:", err);
    }
  }

  renderSvgFloorPlan(floorData) {
    const svg = document.getElementById("library-floor-svg");
    if (!svg) return;

    let html = `
      <defs>
        <!-- Gradients and glow filters -->
        <filter id="glow-route" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
        </pattern>
      </defs>

      <!-- Background Grid -->
      <rect width="1000" height="600" fill="url(#grid-pattern)" />

      <!-- Floor Boundary -->
      <rect x="40" y="40" width="920" height="520" rx="16" fill="rgba(15, 23, 42, 0.4)" stroke="rgba(255,255,255,0.15)" stroke-width="2" />
    `;

    // Render Zones
    (floorData.zones || []).forEach(zone => {
      html += `
        <g class="floor-zone">
          <rect x="${zone.x}" y="${zone.y}" width="${zone.width}" height="${zone.height}" rx="12"
                fill="${zone.color}" stroke="${zone.border}" stroke-width="1.5" stroke-dasharray="4,4" />
          <text x="${zone.x + 14}" y="${zone.y + 24}" fill="${zone.border}" font-size="12" font-weight="700" letter-spacing="0.5">
            ${zone.name}
          </text>
        </g>
      `;
    });

    // Render Aisles & Bookshelf Stacks
    (floorData.aisles || []).forEach(aisle => {
      html += `
        <g class="aisle-stack" data-aisle-id="${aisle.id}" style="cursor:pointer;" onclick="window.mapView.selectAisle('${aisle.id}')">
          <rect x="${aisle.x}" y="${aisle.y}" width="${aisle.width}" height="${aisle.height}" rx="8"
                fill="#1e293b" stroke="#334155" stroke-width="2" />
          
          <!-- Shelf slats -->
          <line x1="${aisle.x + 8}" y1="${aisle.y + 60}" x2="${aisle.x + aisle.width - 8}" y2="${aisle.y + 60}" stroke="#475569" stroke-width="2" />
          <line x1="${aisle.x + 8}" y1="${aisle.y + 120}" x2="${aisle.x + aisle.width - 8}" y2="${aisle.y + 120}" stroke="#475569" stroke-width="2" />
          <line x1="${aisle.x + 8}" y1="${aisle.y + 180}" x2="${aisle.x + aisle.width - 8}" y2="${aisle.y + 180}" stroke="#475569" stroke-width="2" />
          
          <!-- Aisle Badge -->
          <rect x="${aisle.x + 5}" y="${aisle.y + 8}" width="${aisle.width - 10}" height="22" rx="4" fill="#0f172a" />
          <text x="${aisle.x + aisle.width / 2}" y="${aisle.y + 23}" text-anchor="middle" fill="#38bdf8" font-size="11" font-weight="bold">
            ${aisle.id}
          </text>
        </g>
      `;
    });

    // Render Key Anchor Facilities
    if (floorData.entrance) {
      html += `
        <g transform="translate(${floorData.entrance.x}, ${floorData.entrance.y})">
          <circle r="18" fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" stroke-width="2" />
          <text text-anchor="middle" dy="4" font-size="14">🚪</text>
          <text y="28" text-anchor="middle" fill="#10b981" font-size="10" font-weight="600">${floorData.entrance.label}</text>
        </g>
      `;
    }

    if (floorData.kiosk) {
      html += `
        <g transform="translate(${floorData.kiosk.x}, ${floorData.kiosk.y})">
          <circle r="18" fill="rgba(99, 102, 241, 0.25)" stroke="#6366f1" stroke-width="2" />
          <text text-anchor="middle" dy="4" font-size="14">🤖</text>
          <text y="28" text-anchor="middle" fill="#818cf8" font-size="10" font-weight="600">${floorData.kiosk.label}</text>
        </g>
      `;
    }

    if (floorData.stairs) {
      html += `
        <g transform="translate(${floorData.stairs.x}, ${floorData.stairs.y})">
          <rect x="-24" y="-18" width="48" height="36" rx="6" fill="rgba(244, 63, 94, 0.2)" stroke="#f43f5e" stroke-width="2" />
          <text text-anchor="middle" dy="5" font-size="14">🛗</text>
          <text y="30" text-anchor="middle" fill="#f43f5e" font-size="10" font-weight="600">Elevator / Stairs</text>
        </g>
      `;
    }

    // Dynamic Route Layer Container
    html += `<g id="svg-route-layer"></g>`;
    // Dynamic Destination Pin Layer Container
    html += `<g id="svg-pin-layer"></g>`;

    svg.innerHTML = html;
  }

  displayRoute(routeData) {
    this.activeRoute = routeData;
    const destFloor = routeData.destination.floor;

    // Automatically switch to destination floor or origin floor
    if (this.currentFloor !== destFloor) {
      this.switchFloor(destFloor);
    } else {
      this.drawRouteOnSvg(routeData);
    }

    // Update HUD Sidebar
    const b = routeData.book;
    document.getElementById("nav-status-badge").innerText = "Active Routing";
    document.getElementById("nav-status-badge").style.background = "rgba(16, 185, 129, 0.2)";
    document.getElementById("nav-status-badge").style.color = "#34d399";

    document.getElementById("nav-book-summary").innerHTML = `
      <div style="font-weight:700; color:#ffffff; font-size:0.95rem;">${b.title}</div>
      <div style="color:var(--text-muted); font-size:0.82rem; margin-top:2px;">${b.author}</div>
      <div style="margin-top:8px; display:flex; gap:6px; flex-wrap:wrap;">
        <span class="badge" style="background:${b.cover_color}44; color:#ffffff; border:1px solid ${b.cover_color};">
          ${b.ddc_code}
        </span>
        <span class="badge" style="background:rgba(255,255,255,0.08); color:var(--text-main);">
          Floor ${b.location.floor} • Aisle ${b.location.aisle}
        </span>
      </div>
    `;

    document.getElementById("nav-stats-row").style.display = "flex";
    document.getElementById("nav-stat-dist").innerText = `${routeData.estimated_distance_m} m`;
    document.getElementById("nav-stat-time").innerText = `~${routeData.estimated_time_seconds} s`;
    document.getElementById("nav-stat-floor").innerText = `Floor ${destFloor}`;

    const stepsList = document.getElementById("nav-steps-list");
    stepsList.innerHTML = (routeData.instructions || []).map(s => `<li>${s}</li>`).join("");
    document.getElementById("nav-steps-container").style.display = "block";

    // Highlight vertical shelf tier
    this.highlightShelfTier(routeData.tier_visual);
  }

  drawRouteOnSvg(routeData) {
    const routeLayer = document.getElementById("svg-route-layer");
    const pinLayer = document.getElementById("svg-pin-layer");
    if (!routeLayer || !pinLayer) return;

    routeLayer.innerHTML = "";
    pinLayer.innerHTML = "";

    // Find segment for current floor
    const seg = routeData.segments.find(s => s.floor === this.currentFloor);
    if (!seg || !seg.points || seg.points.length === 0) return;

    const pts = seg.points;
    const pathD = pts.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

    // Draw animated glowing path
    routeLayer.innerHTML = `
      <!-- Route Glow Shadow -->
      <path d="${pathD}" fill="none" stroke="#6366f1" stroke-width="8" opacity="0.3" filter="url(#glow-route)" />

      <!-- Main Animated Dash Path -->
      <path d="${pathD}" fill="none" stroke="#38bdf8" stroke-width="4" stroke-dasharray="8,6" stroke-linecap="round">
        <animate attributeName="stroke-dashoffset" from="100" to="0" dur="2s" repeatCount="indefinite" />
      </path>

      <!-- Waypoint Node Beads -->
      ${pts.map(p => `
        <circle cx="${p.x}" cy="${p.y}" r="4" fill="#ffffff" stroke="#6366f1" stroke-width="2" />
      `).join("")}
    `;

    // Draw destination pin if this floor contains the destination shelf
    if (this.currentFloor === routeData.destination.floor) {
      const destX = routeData.destination.x;
      const destY = routeData.destination.y;

      pinLayer.innerHTML = `
        <g transform="translate(${destX}, ${destY})" class="animated-pin">
          <!-- Pulsing Target Rings -->
          <circle r="22" fill="rgba(244, 63, 94, 0.2)" stroke="#f43f5e" stroke-width="2">
            <animate attributeName="r" values="16;28;16" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <circle r="10" fill="#f43f5e" />
          <text text-anchor="middle" dy="4" font-size="12" fill="#ffffff">📍</text>

          <!-- Floating Shelf Label Pill -->
          <rect x="-45" y="-36" width="90" height="22" rx="4" fill="#0f172a" stroke="#f43f5e" stroke-width="1.5" />
          <text x="0" y="-22" text-anchor="middle" fill="#ffffff" font-size="10" font-weight="700">
            ${routeData.destination.shelf_label}
          </text>
        </g>
      `;
    }
  }

  highlightShelfTier(tierVisual) {
    if (!tierVisual) return;
    const activeTier = tierVisual.tier;

    for (let t = 1; t <= 4; t++) {
      const slot = document.getElementById(`tier-slot-${t}`);
      if (!slot) continue;

      const isTarget = t === activeTier;
      slot.classList.toggle("active", isTarget);
      const statusEl = slot.querySelector(".tier-status");
      if (statusEl) {
        statusEl.innerText = isTarget ? "⭐ TARGET BOOK HERE" : "--";
      }
    }
  }

  selectAisle(aisleId) {
    // Filter catalog or notify user
    window.appState.showToast(`Selected Aisle ${aisleId}. Inspecting shelf contents...`);
  }
}
