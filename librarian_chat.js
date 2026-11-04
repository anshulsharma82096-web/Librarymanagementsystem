/**
 * Intelligent Librarian Agent Athena: Conversational UI Component
 */

class LibrarianChatView {
  constructor(containerId, appState) {
    this.container = document.getElementById(containerId);
    this.appState = appState;
    this.messages = [];
    this.init();
  }

  init() {
    this.renderLayout();
    this.sendInitialGreeting();
  }

  renderLayout() {
    this.container.innerHTML = `
      <div class="chat-layout">
        <!-- Sidebar Curator Persona Info -->
        <div class="chat-sidebar">
          <div class="card" style="display:flex; flex-direction:column; align-items:center; text-align:center; gap:12px;">
            <div class="librarian-avatar" style="width:64px; height:64px; font-size:32px;">
              🏛️
            </div>
            <div>
              <h3 style="font-size:1.1rem; font-weight:700;">Athena</h3>
              <div style="font-size:0.8rem; color:var(--accent-secondary); font-weight:600;">
                Master AI Librarian & Curator
              </div>
            </div>
            <p style="font-size:0.82rem; color:var(--text-muted); line-height:1.5;">
              Armed with Dewey classification reasoning, semantic catalog RAG, 
              and physical A* stack-routing across both floors.
            </p>
            <div style="width:100%; height:1px; background:var(--border-color); margin:4px 0;"></div>
            <div style="width:100%; text-align:left; font-size:0.8rem; color:var(--text-muted); display:flex; flex-direction:column; gap:8px;">
              <div>⚡ <strong>Capabilities:</strong></div>
              <div>• Physical shelf pathfinding</div>
              <div>• Multi-book comparative radar</div>
              <div>• Dewey & LoC call-number decoding</div>
              <div>• Curated multi-stage learning roadmaps</div>
              <div>• Automatic book holds & reservations</div>
            </div>
          </div>

          <div class="card" style="padding:16px;">
            <div style="font-size:0.85rem; font-weight:700; margin-bottom:10px; color:#cbd5e1;">
              💡 Common Research Inquiries
            </div>
            <div style="display:flex; flex-direction:column; gap:6px;">
              <button class="suggestion-chip" onclick="window.librarianChat.handleChipClick('Where is Dune located?')">
                📍 Where is Dune located?
              </button>
              <button class="suggestion-chip" onclick="window.librarianChat.handleChipClick('Compare 1984 and Brave New World')">
                ⚖️ Compare 1984 vs Brave New World
              </button>
              <button class="suggestion-chip" onclick="window.librarianChat.handleChipClick('I want a learning path for AI foundations')">
                🎓 AI Foundations Roadmap
              </button>
              <button class="suggestion-chip" onclick="window.librarianChat.handleChipClick('What is Dewey Decimal 006.3?')">
                🏷️ Explain Dewey 006.3
              </button>
              <button class="suggestion-chip" onclick="window.librarianChat.handleChipClick('Recommend accessible books on consciousness')">
                🧠 Books on Consciousness
              </button>
            </div>
          </div>
        </div>

        <!-- Main Chat Stream -->
        <div class="chat-container">
          <div class="chat-header">
            <div class="chat-librarian-profile">
              <div class="librarian-avatar">🏛️</div>
              <div>
                <div style="font-weight:700; font-size:0.95rem;">Athena • Alexandria Library Terminal</div>
                <div style="font-size:0.75rem; color:#34d399; display:flex; align-items:center; gap:6px;">
                  <span class="status-dot"></span> Online • Ready for Inquiries
                </div>
              </div>
            </div>
            <button class="btn btn-secondary" style="font-size:0.78rem; padding:6px 12px;" onclick="window.librarianChat.clearChat()">
              Clear History
            </button>
          </div>

          <!-- Message History Scroll Area -->
          <div class="chat-messages" id="chat-messages-container">
            <!-- Dynamic bubbles injected here -->
          </div>

          <!-- Suggested Quick Chips -->
          <div class="chat-suggestions" id="chat-dynamic-chips">
            <div class="suggestion-chip" onclick="window.librarianChat.handleChipClick('Where is Dune?')">Where is Dune?</div>
            <div class="suggestion-chip" onclick="window.librarianChat.handleChipClick('Compare 1984 and Brave New World')">Compare 1984 & Brave New World</div>
            <div class="suggestion-chip" onclick="window.librarianChat.handleChipClick('Show me books on Deep Learning')">Deep Learning Books</div>
            <div class="suggestion-chip" onclick="window.librarianChat.handleChipClick('Explain DDC Call Numbers')">Explain DDC Numbers</div>
          </div>

          <!-- Input Bar -->
          <div class="chat-input-bar">
            <input type="text" id="chat-user-input" placeholder="Ask Athena about any subject, book location, or comparison..." 
                   onkeydown="if(event.key === 'Enter') window.librarianChat.sendMessage()" />
            <button class="btn btn-primary" onclick="window.librarianChat.sendMessage()">
              <span>Send</span> ➔
            </button>
          </div>
        </div>
      </div>
    `;
  }

  sendInitialGreeting() {
    this.addMessage({
      role: "librarian",
      message: (
        "Welcome to the **Alexandria Digital Library**. I am **Athena**, your master curator and navigation guide.\n\n" +
        "You can ask me to **locate physical books** (I will plot turn-by-turn routes on the map), " +
        "**compare masterworks** side-by-side, **recommend reading pathways**, or explain our **Dewey Decimal stacks**.\n\n" +
        "How may I guide your intellectual journey today?"
      ),
      suggested_actions: [
        "Where is Artificial Intelligence: A Modern Approach?",
        "Compare Dune vs Foundation",
        "Give me a dystopian reading roadmap"
      ]
    });
  }

  async sendMessage(customText = null) {
    const input = document.getElementById("chat-user-input");
    const text = customText || (input ? input.value.trim() : "");
    if (!text) return;

    if (input && !customText) input.value = "";

    // Add user bubble
    this.addMessage({ role: "user", message: text });

    // Typing indicator
    this.showTypingIndicator();

    try {
      const res = await fetch("/api/librarian/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: json = JSON.stringify({ message: text })
      });
      const data = await res.json();
      this.hideTypingIndicator();
      this.addMessage(data);

      // Update quick chips
      if (data.suggested_actions) {
        this.updateDynamicChips(data.suggested_actions);
      }
    } catch (err) {
      this.hideTypingIndicator();
      this.addMessage({
        role: "librarian",
        message: "Apologies, I encountered an interruption while querying the catalog. Please try again."
      });
    }
  }

  handleChipClick(text) {
    this.sendMessage(text);
  }

  updateDynamicChips(actions) {
    const chipContainer = document.getElementById("chat-dynamic-chips");
    if (!chipContainer || !actions || actions.length === 0) return;

    chipContainer.innerHTML = actions.map(act => `
      <div class="suggestion-chip" onclick="window.librarianChat.handleChipClick('${act.replace(/'/g, "\\'")}')">
        ${act}
      </div>
    `).join("");
  }

  addMessage(msgObj) {
    this.messages.push(msgObj);
    const container = document.getElementById("chat-messages-container");
    if (!container) return;

    const isUser = msgObj.role === "user";
    const msgEl = document.createElement("div");
    msgEl.className = `chat-msg ${isUser ? "user" : "librarian"}`;

    const formattedContent = this.formatMarkdown(msgObj.message);

    let actionCardHtml = "";
    if (msgObj.action) {
      actionCardHtml = this.renderActionCard(msgObj.action);
    }

    msgEl.innerHTML = `
      <div class="librarian-avatar" style="${isUser ? 'background:#3b82f6;' : ''}">
        ${isUser ? '👤' : '🏛️'}
      </div>
      <div class="msg-bubble">
        <div>${formattedContent}</div>
        ${actionCardHtml}
      </div>
    `;

    container.appendChild(msgEl);
    container.scrollTop = container.scrollHeight;
  }

  renderActionCard(action) {
    if (action.type === "OPEN_MAP") {
      const b = action.route.book;
      return `
        <div style="margin-top:14px; background:rgba(15,23,42,0.7); border:1px solid var(--accent-primary); border-radius:var(--radius-md); padding:14px; display:flex; flex-direction:column; gap:10px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <span class="badge" style="background:#6366f1; color:#fff;">Floor ${action.floor} • ${action.shelf_label}</span>
              <div style="font-weight:700; margin-top:4px;">${b.title}</div>
            </div>
            <button class="btn btn-primary" style="padding:6px 14px; font-size:0.8rem;" onclick="window.appState.navigateToBook('${b.id}')">
              🗺️ Open Map & Follow Trail
            </button>
          </div>
        </div>
      `;
    }

    if (action.type === "OPEN_COMPARISON") {
      return `
        <div style="margin-top:14px; background:rgba(15,23,42,0.7); border:1px solid var(--accent-secondary); border-radius:var(--radius-md); padding:14px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="font-size:0.85rem; color:#cbd5e1;">Interactive Radar Chart & Feature Matrix is ready in Studio.</div>
            <button class="btn btn-primary" style="padding:6px 14px; font-size:0.8rem;" onclick="window.appState.switchTab('comparison')">
              ⚖️ Open Comparison Studio
            </button>
          </div>
        </div>
      `;
    }

    return "";
  }

  showTypingIndicator() {
    const container = document.getElementById("chat-messages-container");
    if (!container) return;
    const typing = document.createElement("div");
    typing.id = "chat-typing-indicator";
    typing.className = "chat-msg librarian";
    typing.innerHTML = `
      <div class="librarian-avatar">🏛️</div>
      <div class="msg-bubble" style="color:var(--text-dim); display:flex; gap:4px; align-items:center;">
        Athena is consulting the catalog<span>.</span><span>.</span><span>.</span>
      </div>
    `;
    container.appendChild(typing);
    container.scrollTop = container.scrollHeight;
  }

  hideTypingIndicator() {
    const el = document.getElementById("chat-typing-indicator");
    if (el) el.remove();
  }

  clearChat() {
    this.messages = [];
    const container = document.getElementById("chat-messages-container");
    if (container) container.innerHTML = "";
    this.sendInitialGreeting();
  }

  formatMarkdown(text) {
    if (!text) return "";
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.1); padding:2px 6px; border-radius:4px; font-family:var(--font-mono); font-size:0.85em;">$1</code>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');
    return html;
  }
}
