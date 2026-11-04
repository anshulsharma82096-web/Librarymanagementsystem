/**
 * Alexandria AI Library Navigator - Master Application Controller
 */

// Smart Fetch Interceptor for Static Hosting (GitHub Pages / Vercel / Netlify)
const originalFetch = window.fetch;
window.fetch = async function(url, options = {}) {
  try {
    const res = await originalFetch(url, options);
    if (res.ok) return res;
    if (typeof url === "string" && url.includes("/api/")) {
      return handleLocalApiFallback(url, options);
    }
    return res;
  } catch (e) {
    if (typeof url === "string" && url.includes("/api/")) {
      return handleLocalApiFallback(url, options);
    }
    throw e;
  }
};

function handleLocalApiFallback(url, options) {
  const engine = window.localEngine;
  let body = {};
  if (options && options.body) {
    try { body = JSON.parse(options.body); } catch(e) {}
  }

  let data = {};

  if (url.includes("/api/books")) {
    data = { total: engine.books.length, books: engine.books };
  } else if (url.includes("/api/navigation/floors/1")) {
    data = {
      name: "Floor 1: Grand Atrium & Sci-Tech Pavilion",
      entrance: { x: 80, y: 480, label: "Main Entrance" },
      kiosk: { x: 160, y: 480, label: "Interactive AI Kiosk" },
      stairs: { x: 880, y: 480, label: "Grand Staircase & Elevator" },
      zones: [
        { name: "Natural Sciences Wing (A1-A4)", x: 80, y: 80, width: 260, height: 340, color: "rgba(2, 132, 199, 0.12)", border: "#0284c7" },
        { name: "Computer Science & AI Stacks (B1-B4)", x: 380, y: 80, width: 320, height: 340, color: "rgba(37, 99, 235, 0.12)", border: "#2563eb" },
        { name: "Central Atrium Corridor", x: 80, y: 440, width: 860, height: 90, color: "rgba(100, 116, 139, 0.08)", border: "#64748b" }
      ],
      aisles: [
        { id: "A1", x: 120, y: 120, width: 50, height: 260 },
        { id: "A2", x: 220, y: 120, width: 50, height: 260 },
        { id: "B1", x: 420, y: 120, width: 50, height: 260 },
        { id: "B2", x: 520, y: 120, width: 50, height: 260 }
      ]
    };
  } else if (url.includes("/api/navigation/floors/2")) {
    data = {
      name: "Floor 2: Humanities, Philosophy & Literature Mezzanine",
      entrance: { x: 880, y: 480, label: "Elevator / Stair Arrival" },
      kiosk: { x: 800, y: 480, label: "Mezzanine Guide Station" },
      stairs: { x: 880, y: 480, label: "Stairs to Floor 1" },
      zones: [
        { name: "Literature & Speculative Fiction (C1-C4)", x: 80, y: 80, width: 300, height: 340, color: "rgba(234, 88, 12, 0.12)", border: "#ea580c" },
        { name: "Philosophy & Mind (D1-D4)", x: 400, y: 80, width: 280, height: 340, color: "rgba(124, 58, 237, 0.12)", border: "#7c3aed" },
        { name: "World History (E1-E4)", x: 700, y: 80, width: 240, height: 340, color: "rgba(220, 38, 38, 0.12)", border: "#dc2626" },
        { name: "Silent Mezzanine Gallery", x: 80, y: 440, width: 860, height: 90, color: "rgba(100, 116, 139, 0.08)", border: "#64748b" }
      ],
      aisles: [
        { id: "C1", x: 140, y: 120, width: 50, height: 260 },
        { id: "C2", x: 240, y: 120, width: 50, height: 260 },
        { id: "D1", x: 440, y: 120, width: 50, height: 260 },
        { id: "E1", x: 760, y: 120, width: 50, height: 260 }
      ]
    };
  } else if (url.includes("/api/navigation/route")) {
    data = engine.findRoute(body.book_id, body.origin_floor || 1);
  } else if (url.includes("/api/rag/recommend")) {
    data = engine.ragSearch(body.query || "", body.top_k || 4);
  } else if (url.includes("/api/comparison")) {
    data = engine.compare(body.book_ids || []);
  } else if (url.includes("/api/librarian/chat")) {
    data = engine.librarianChat(body.message || "");
  } else if (url.includes("/api/taxonomy")) {
    data = {
      categories: ["Computer Science & AI", "Natural Sciences & Physics", "Philosophy & Psychology", "Literature & Speculative Fiction", "History & Civilization"]
    };
  } else if (url.includes("/api/knowledge-graph")) {
    data = {
      stats: { total_nodes: engine.books.length + 5, total_edges: 35, learning_paths: 3 },
      nodes: engine.books.map(b => ({
        id: b.id, label: b.title, type: "book", author: b.author, year: b.year, ddc: b.ddc_code,
        floor: b.location.floor, aisle: b.location.aisle, shelf: b.location.shelf_label,
        category: b.category, rating: b.rating, color: b.cover_color, size: 24
      })),
      edges: engine.books.map((b, i) => ({
        source: b.id,
        target: engine.books[(i + 1) % engine.books.length].id,
        relation: "RELATED_THEME"
      }))
    };
  } else if (url.includes("/api/learning-paths")) {
    data = {
      learning_paths: [
        { path: { id: "ai", name: "AI & Neural Path", difficulty: "Intermediate" }, books: engine.books.slice(0, 3) },
        { path: { id: "dystopia", name: "Dystopian Systems", difficulty: "Accessible" }, books: engine.books.slice(6, 9) }
      ]
    };
  } else {
    data = { status: "ok" };
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}

class AppState {
  constructor() {
    this.currentTab = "map";
    this.cachedBooks = [];
  }

  init() {
    this.setupEventListeners();
    this.loadInitialData();
  }

  setupEventListeners() {
    // Keyboard shortcut '/' to search
    window.addEventListener("keydown", (e) => {
      if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
        e.preventDefault();
        const searchInput = document.getElementById("global-search-input");
        if (searchInput) {
          searchInput.focus();
        }
      }
    });
  }

  async loadInitialData() {
    try {
      const res = await fetch("/api/books");
      const data = await res.json();
      this.cachedBooks = data.books || [];
    } catch (err) {
      console.error("Failed to preload books:", err);
    }
  }

  switchTab(tabId) {
    this.currentTab = tabId;

    // Update Tab Buttons
    document.querySelectorAll(".tab-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.tab === tabId);
    });

    // Update Tab Panes
    document.querySelectorAll(".tab-pane").forEach(pane => {
      pane.classList.toggle("active", pane.id === `tab-${tabId}`);
    });
  }

  async navigateToBook(bookId) {
    try {
      this.switchTab("map");
      this.showToast("Calculating A* spatial route to shelf...");

      const res = await fetch("/api/navigation/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book_id: bookId, origin_floor: 1, origin_name: "kiosk" })
      });
      const routeData = await res.json();

      if (routeData.error) {
        this.showToast(routeData.error);
        return;
      }

      if (window.mapView) {
        window.mapView.displayRoute(routeData);
      }
      this.showToast(`Route calculated: ${routeData.estimated_distance_m}m to ${routeData.destination.shelf_label}`);
    } catch (err) {
      console.error("Navigation error:", err);
      this.showToast("Failed to calculate navigation route.");
    }
  }

  openComparisonWith(bookIds) {
    this.switchTab("comparison");
    if (window.compStudio) {
      if (bookIds.length === 1) {
        // Pair with another relevant book
        const first = bookIds[0];
        const second = first === "lit-1984" ? "lit-brave-new-world" : "cs-aima";
        window.compStudio.setPreset([first, second]);
      } else {
        window.compStudio.setPreset(bookIds);
      }
    }
  }

  async reserveBook(bookId) {
    try {
      const res = await fetch(`/api/books/${bookId}/reserve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_name: "Library Patron" })
      });
      const data = await res.json();
      if (data.success) {
        this.showToast(`Reserved! Stored at: ${data.hold_shelf}`);
        // Close modal if open
        this.closeModal();
        if (window.catalogBrowser) {
          window.catalogBrowser.fetchBooks();
        }
      } else {
        this.showToast(data.error || "Reservation failed");
      }
    } catch (err) {
      console.error("Reserve error:", err);
      this.showToast("Reservation server error.");
    }
  }

  openBookDossier(book) {
    const backdrop = document.getElementById("book-modal-backdrop");
    const title = document.getElementById("modal-book-title");
    const meta = document.getElementById("modal-book-meta");
    const synopsis = document.getElementById("modal-book-synopsis");
    const excerpt = document.getElementById("modal-book-excerpt");
    const location = document.getElementById("modal-book-location");
    const metrics = document.getElementById("modal-book-metrics");
    const actions = document.getElementById("modal-book-actions");

    if (!backdrop) return;

    title.innerText = book.title;
    meta.innerHTML = `
      <span class="badge" style="background:${book.cover_color}33; color:#fff; border:1px solid ${book.cover_color};">
        ${book.ddc_code}
      </span>
      <span>${book.author} (${book.year})</span> • 
      <span style="color:#facc15;">⭐ ${book.rating} / 5.0</span>
    `;

    synopsis.innerText = book.synopsis;
    excerpt.innerText = `"${book.key_excerpt}"`;

    const loc = book.location;
    location.innerHTML = `
      <div><strong>Floor:</strong> ${loc.floor} (${loc.section})</div>
      <div><strong>Aisle & Shelf:</strong> Aisle ${loc.aisle}, Unit #${loc.shelf_unit}, Tier ${loc.tier} (${loc.shelf_label})</div>
      <div><strong>Availability:</strong> ${book.copies_available} / ${book.copies_total} copies in stacks</div>
    `;

    // Metrics progress bars
    const m = book.metrics;
    metrics.innerHTML = `
      <div style="font-size:0.82rem; display:flex; flex-direction:column; gap:6px;">
        <div style="display:flex; justify-content:space-between;">
          <span>Complexity:</span> <span>${m.complexity} / 10</span>
        </div>
        <div style="width:100%; height:6px; background:#1e293b; border-radius:3px; overflow:hidden;">
          <div style="width:${m.complexity * 10}%; height:100%; background:#6366f1;"></div>
        </div>

        <div style="display:flex; justify-content:space-between; margin-top:4px;">
          <span>Narrative Pacing:</span> <span>${m.pacing} / 10</span>
        </div>
        <div style="width:100%; height:6px; background:#1e293b; border-radius:3px; overflow:hidden;">
          <div style="width:${m.pacing * 10}%; height:100%; background:#06b6d4;"></div>
        </div>

        <div style="display:flex; justify-content:space-between; margin-top:4px;">
          <span>Thematic Gravitas:</span> <span>${m.thematic_weight} / 10</span>
        </div>
        <div style="width:100%; height:6px; background:#1e293b; border-radius:3px; overflow:hidden;">
          <div style="width:${m.thematic_weight * 10}%; height:100%; background:#ec4899;"></div>
        </div>
      </div>
    `;

    actions.innerHTML = `
      <button class="btn btn-outline" onclick="window.appState.openComparisonWith(['${book.id}']); window.appState.closeModal();">
        ⚖️ Compare in Studio
      </button>
      <button class="btn btn-secondary" onclick="window.appState.reserveBook('${book.id}')">
        📦 Reserve Copy
      </button>
      <button class="btn btn-primary" onclick="window.appState.navigateToBook('${book.id}'); window.appState.closeModal();">
        🧭 Navigate to Shelf
      </button>
    `;

    backdrop.classList.add("open");
  }

  closeModal() {
    const backdrop = document.getElementById("book-modal-backdrop");
    if (backdrop) backdrop.classList.remove("open");
  }

  showToast(message) {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<span>✨</span> <div>${message}</div>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  handleGlobalSearch(query) {
    if (!query) return;
    this.switchTab("catalog");
    const input = document.getElementById("catalog-search-input");
    if (input) {
      input.value = query;
      if (window.catalogBrowser) {
        window.catalogBrowser.filterBooks();
      }
    }
  }
}

// Instantiate global state
window.appState = new AppState();

// Initialize components on DOM load
window.addEventListener("DOMContentLoaded", () => {
  window.appState.init();
  window.mapView = new LibraryMapView("tab-map", window.appState);
  window.librarianChat = new LibrarianChatView("tab-chat", window.appState);
  window.compStudio = new ComparisonStudioView("tab-comparison", window.appState);
  window.ragView = new RAGRecommenderView("tab-rag", window.appState);
  window.kgView = new KnowledgeGraphView("tab-graph", window.appState);
  window.catalogBrowser = new CatalogBrowserView("tab-catalog", window.appState);
});
