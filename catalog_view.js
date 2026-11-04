/**
 * Catalog & Physical Stacks Browser Component
 */

class CatalogBrowserView {
  constructor(containerId, appState) {
    this.container = document.getElementById(containerId);
    this.appState = appState;
    this.books = [];
    this.categories = [];
    this.init();
  }

  async init() {
    this.renderLayout();
    await this.loadTaxonomy();
    await this.fetchBooks();
  }

  renderLayout() {
    this.container.innerHTML = `
      <div class="catalog-layout">
        <!-- Filter Toolbar -->
        <div class="catalog-filters-bar">
          <div class="filter-group">
            <input type="text" id="catalog-search-input" class="quick-search-box" style="width:260px;" 
                   placeholder="Search title, author, call number..." oninput="window.catalogBrowser.filterBooks()" />
          </div>

          <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap;">
            <div class="filter-group">
              <label style="font-size:0.82rem; color:var(--text-muted); font-weight:600;">Category:</label>
              <select id="catalog-category-select" class="filter-select" onchange="window.catalogBrowser.filterBooks()">
                <option value="All">All Categories</option>
              </select>
            </div>

            <div class="filter-group">
              <label style="font-size:0.82rem; color:var(--text-muted); font-weight:600;">Floor:</label>
              <select id="catalog-floor-select" class="filter-select" onchange="window.catalogBrowser.filterBooks()">
                <option value="All">Both Floors</option>
                <option value="1">Floor 1 (Sci-Tech & CS)</option>
                <option value="2">Floor 2 (Humanities & Lit)</option>
              </select>
            </div>

            <div class="filter-group">
              <label style="font-size:0.82rem; color:var(--text-muted); font-weight:600;">Sort By:</label>
              <select id="catalog-sort-select" class="filter-select" onchange="window.catalogBrowser.filterBooks()">
                <option value="rating">Highest Rated</option>
                <option value="title">Title (A-Z)</option>
                <option value="year">Publication Year</option>
                <option value="complexity">Complexity / Depth</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Total Count Status -->
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; color:var(--text-muted);">
          <span id="catalog-count-label">Showing volumes in collection...</span>
        </div>

        <!-- Book Cards Grid -->
        <div class="catalog-books-grid" id="catalog-grid-container">
          <!-- Dynamic cards injected here -->
        </div>
      </div>
    `;
  }

  async loadTaxonomy() {
    try {
      const res = await fetch("/api/taxonomy");
      const data = await res.json();
      const select = document.getElementById("catalog-category-select");
      if (select && data.categories) {
        data.categories.forEach(cat => {
          const opt = document.createElement("option");
          opt.value = cat;
          opt.innerText = cat;
          select.appendChild(opt);
        });
      }
    } catch (err) {
      console.error("Failed to load taxonomy:", err);
    }
  }

  async fetchBooks() {
    try {
      const res = await fetch("/api/books");
      const data = await res.json();
      this.books = data.books || [];
      this.filterBooks();
    } catch (err) {
      console.error("Failed to fetch books:", err);
    }
  }

  filterBooks() {
    const searchVal = (document.getElementById("catalog-search-input")?.value || "").toLowerCase().trim();
    const catVal = document.getElementById("catalog-category-select")?.value || "All";
    const floorVal = document.getElementById("catalog-floor-select")?.value || "All";
    const sortVal = document.getElementById("catalog-sort-select")?.value || "rating";

    let filtered = this.books.filter(b => {
      if (catVal !== "All" && b.category !== catVal) return false;
      if (floorVal !== "All" && b.location.floor !== parseInt(floorVal)) return false;
      if (searchVal) {
        const text = `${b.title} ${b.author} ${b.ddc_code} ${b.category} ${(b.tags || []).join(' ')}`.toLowerCase();
        if (!text.includes(searchVal)) return false;
      }
      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      if (sortVal === "rating") return b.rating - a.rating;
      if (sortVal === "title") return a.title.localeCompare(b.title);
      if (sortVal === "year") return b.year - a.year;
      if (sortVal === "complexity") return b.metrics.complexity - a.metrics.complexity;
      return 0;
    });

    this.renderCards(filtered);
  }

  renderCards(booksList) {
    const container = document.getElementById("catalog-grid-container");
    const countLabel = document.getElementById("catalog-count-label");
    if (!container) return;

    if (countLabel) {
      countLabel.innerText = `Displaying ${booksList.length} volumes in library stacks.`;
    }

    if (booksList.length === 0) {
      container.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--text-muted);">
          No matching books found. Try adjusting your query or filters.
        </div>
      `;
      return;
    }

    container.innerHTML = booksList.map(b => {
      const avail = b.copies_available > 0;
      return `
        <div class="book-card" onclick="window.catalogBrowser.openBookModal('${b.id}')">
          <div class="book-spine-strip" style="background:${b.cover_color};"></div>
          
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <span class="badge" style="background:${b.cover_color}33; color:#fff; border:1px solid ${b.cover_color};">
              ${b.ddc_code}
            </span>
            <span style="font-size:0.8rem; font-weight:700; color:#facc15;">⭐ ${b.rating}</span>
          </div>

          <div>
            <h4 style="font-size:1.05rem; font-weight:700; color:#fff; line-height:1.3;">${b.title}</h4>
            <div style="font-size:0.82rem; color:var(--text-muted); margin-top:3px;">
              ${b.author} (${b.year})
            </div>
          </div>

          <div style="font-size:0.78rem; color:var(--text-dim); display:flex; gap:6px; flex-wrap:wrap;">
            <span>Floor ${b.location.floor}</span> • <span>Aisle ${b.location.aisle}</span> • <span>${b.location.shelf_label}</span>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:auto; pt-2; border-top:1px solid var(--border-color); padding-top:10px;">
            <span style="font-size:0.78rem; font-weight:600; color:${avail ? '#34d399' : '#f87171'};">
              ${avail ? `● ${b.copies_available} Available` : '○ Checked Out'}
            </span>
            <div style="display:flex; gap:6px;" onclick="event.stopPropagation()">
              <button class="btn btn-outline" style="font-size:0.72rem; padding:4px 8px;" onclick="window.appState.openComparisonWith(['${b.id}'])">
                ⚖️ Compare
              </button>
              <button class="btn btn-primary" style="font-size:0.72rem; padding:4px 10px;" onclick="window.appState.navigateToBook('${b.id}')">
                🧭 Map
              </button>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  openBookModal(bookId) {
    const book = this.books.find(b => b.id === bookId);
    if (!book) return;
    window.appState.openBookDossier(book);
  }
}
