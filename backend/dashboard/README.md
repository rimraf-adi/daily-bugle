# `dashboard` Module Specification (Streamlit Control Room)

Interactive, developer-focused frontend control room designed for AI agents, developers, and researchers to **control, monitor, and visualize raw API outputs** across all Daily Bugle modules without LLM sanitization.

---

## 1. How Agents Are Supposed to Identify It

Autonomous agents and developer frameworks should identify this module via the following capability contract:

### Capability Signature
- **Namespace:** `dashboard` (inside `backend`)
- **Primary Role:** Interactive visual control room and debugging dashboard for `arxiv`, `reddit`, `gmail`, and `llm_router`.
- **Display Standard:** **Raw API Outputs** (Un-sanitized JSON payloads, raw Atom XML streams, raw RFC822 email headers, and raw model completions).
- **Technology:** Streamlit 1.64+ managed via `uv`.

### Agent Intent Routing Matrix

| User Goal / Agent Intent | Recommended Command / Action | Description |
| :--- | :--- | :--- |
| **"Start the frontend dashboard"** | `uv run streamlit run app.py` | Launches interactive control room on localhost. |
| **"Inspect raw arXiv XML & JSON"** | Dashboard -> `1. arXiv Research Ingestion` | Visualizes raw Atom XML and structured JSON cards. |
| **"Manage Reddit watchlist"** | Dashboard -> `2. Reddit Unofficial Watcher` | Add/remove subreddits and test deduplication. |
| **"Inspect Substack emails"** | Dashboard -> `3. Gmail Substack Tracker` | Reads IMAP mailbox, headers, and extracted web links. |
| **"Test OpenRouter completions"** | Dashboard -> `4. OpenRouter LLM Router` | Live playground with raw JSON schema inspector. |
| **"View all feeds simultaneously"** | Dashboard -> `5. Multi-Source Raw Feed` | 3-way simultaneous snapshot across all channels. |

---

## 2. Module File Structure

```
backend/
├── app.py               # Streamlit entrypoint forwarder
└── dashboard/
    ├── __init__.py      # Package facade & app path resolution
    ├── app.py           # Multi-module Streamlit control room
    └── README.md        # Agent specification and developer documentation (this file)
```

---

## 3. How to Launch

From the `backend/` directory:

```bash
# Launch on default port (http://localhost:8501)
uv run streamlit run app.py

# Or specify custom port
uv run streamlit run app.py --server.port 8501
```

---

## 4. Module Control Capabilities

### 1. arXiv Research Ingestion
- **Controls:** Category code picker (all 166 categories across 8 disciplines) or free-text query, max results, sort by (`submittedDate`, `lastUpdatedDate`, `relevance`), sort order.
- **Visualizations:**
  - Structured raw cards with authors, categories, and direct links (Web HTML, PDF, Abstract).
  - Complete JSON payload (`to_dict()`).
  - Raw Atom XML stream directly from the API.

### 2. Reddit Unofficial Watcher (Zero-Auth)
- **Controls:** Ad-hoc subreddit stream picker (`hot`, `new`, `top` [day/week/month], `rising`) and interactive Watchlist Manager.
- **Visualizations:**
  - Raw Reddit post cards with author, subreddit, discussion permalink, and submitted external URL.
  - Raw JSON dump and raw Atom XML feed.
  - Deduplication test button (`Poll New Unseen Posts`).

### 3. Gmail Substack Tracker
- **Controls:** Mailbox folder select (`INBOX`), email limit, unread-only toggle, custom search query.
- **Visualizations:**
  - Direct Substack web link extraction (`https://*.substack.com/p/*`).
  - Raw plain text body and HTML snippet.
  - Extracted external article links and raw email headers.

### 4. OpenRouter LLM Router
- **Controls:** Model picker (`openrouter/free`, `meta-llama/llama-3.3-70b-instruct:free`, `google/gemini-2.0-flash-exp:free`, or custom ID), system prompt, user prompt, temperature slider.
- **Visualizations:**
  - Token consumption metrics (prompt, completion, total tokens).
  - Exact OpenRouter JSON response schema (`resp.raw` / `resp.to_dict()`).
  - Non-sanitized raw completion text.

### 5. Multi-Source Raw Feed
- Single-click 3-channel snapshot pulling arXiv preprints, Reddit developer posts, and Substack newsletters in parallel.
