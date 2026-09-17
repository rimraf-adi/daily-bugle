# Daily Bugle - Backend

A multi-source research and newsletter intelligence backend powered by the `uv` package manager and Python 3.13+, featuring an interactive Streamlit control dashboard.

---

## Project Structure

```
backend/
├── .env                   # Local credentials (git-ignored)
├── .env.example           # Configuration template
├── .gitignore
├── .venv/                 # Virtual environment managed by uv
├── pyproject.toml         # Dependencies and project metadata
├── uv.lock                # Deterministic dependency lockfile
├── README.md              # Project documentation (this file)
├── main.py                # Demonstration CLI entrypoint
├── app.py                 # Streamlit frontend entrypoint
├── tests/
│   ├── test_arxiv.py      # arXiv ingestion and taxonomy unit tests
│   ├── test_llm_router.py # LLM router schema and mock tests
│   ├── test_gmail.py      # Substack email tracking and digest tests
│   └── test_reddit.py     # Unofficial Reddit scraper and tracker tests
├── arxiv/                 # arXiv Ingestion & Semantic Digest Module
│   ├── __init__.py        # Public API facade
│   ├── categories.py      # Full 166-category taxonomy across all 8 disciplines
│   ├── client.py          # ArxivClient with HTTP query logic and Atom XML parser
│   ├── models.py          # Semantic models (ArxivPaper, PaperLinks, NewsletterDigest)
│   └── README.md          # Module specification for agents & developers
├── llm_router/            # OpenRouter LLM Inference & Routing Module
│   ├── __init__.py        # Public API facade
│   ├── client.py          # LLMRouter implementation using OpenRouter REST API
│   ├── models.py          # ChatMessage, ResponseChoice, UsageInfo, ChatResponse
│   └── README.md          # Module specification for agents & developers
├── gmail/                 # Gmail IMAP Substack Newsletter Tracking Module
│   ├── __init__.py        # Public API facade
│   ├── client.py          # GmailClient IMAP connection & Substack parser
│   ├── models.py          # SubstackEmail and SubstackDigest models
│   └── README.md          # Module specification for agents & developers
├── reddit/                # Unofficial Reddit Scraper & Subreddit Watcher
│   ├── __init__.py        # Public API facade
│   ├── crawler.py         # Zero-auth RedditCrawler with RSS streams & TTL cache
│   ├── models.py          # RedditPost, TrackedSubreddit, RedditDigest models
│   ├── tracker.py         # SubredditTracker (watchlist, deduplication, filters)
│   └── README.md          # Module specification for agents & developers
└── dashboard/             # Streamlit Interactive Control Room (Demo Frontend)
    ├── __init__.py        # Public package facade
    ├── app.py             # Streamlit raw output visualizer & control room
    └── README.md          # Module specification for agents & developers
```

---

## Prerequisites & Setup

Ensure you have [uv](https://github.com/astral-sh/uv) installed:

```bash
# Navigate to the backend directory
cd backend

# Sync dependencies and activate virtual environment
uv sync

# Configure your environment variables
cp .env.example .env
# Edit .env with your credentials:
# - OPENROUTER_API_KEY
# - GMAIL_USER
# - GMAIL_APP_PASSWORD

# Run all unit tests across all 4 modules
uv run python -m unittest discover -s tests

# Launch the interactive Streamlit dashboard
uv run streamlit run app.py
```

---

## Module: `dashboard` (Streamlit Demo Frontend)

Interactive control room and visualizer providing complete control over all ingestion and routing modules. Designed specifically for inspecting **raw API outputs** (un-sanitized XML, JSON schemas, headers, and token metrics) prior to LLM processing.

### How Agents Are Supposed to Identify It

- **Namespace:** `dashboard` (entrypoint: `backend/app.py` or `backend/dashboard/app.py`)
- **Primary Role:** Interactive UI for controlling modules and inspecting raw payloads.
- **Launch Command:** `uv run streamlit run app.py`

### Key Views & Controls:
1. **arXiv Research Explorer**: Query by any of the 166 categories or free-text; visualizes raw Atom XML and JSON payloads with clickable PDF/HTML links.
2. **Reddit Unofficial Watcher**: Inspect raw RSS feeds, test ad-hoc subreddits, manage the watchlist, and verify deduplication.
3. **Gmail Substack Ingestion**: Connect to Gmail IMAP, search mailbox, extract raw headers, text bodies, and direct Substack web links.
4. **OpenRouter Playground**: Interactive model runner inspecting the exact OpenRouter JSON schema (`id`, `model`, `choices`, `usage.prompt_tokens`, `usage.total_tokens`).
5. **Multi-Source Raw Feed**: One-click 3-channel raw snapshot from arXiv, Reddit, and Gmail in parallel.

---

## Module: `reddit` (Unofficial Watcher & Tracker)

Zero-authentication Reddit crawler and watchlist tracker designed for monitoring community discussions and developer buzz **without requiring Reddit API keys or OAuth credentials**.

- **Namespace:** `reddit` (accessible via `from reddit import ...`)
- **Authentication:** Zero-Auth (None). Uses public Atom/RSS streams with built-in in-memory TTL caching (60s) to avoid 429 rate limits.
- **Deduplication:** Tracks seen post IDs so periodic newsletter jobs only receive **new, unseen discussions**.

```python
from reddit import SubredditTracker, get_hot_posts

# 1. Quick ad-hoc post tracking
posts = get_hot_posts("LocalLLaMA", limit=5)
for p in posts:
    print(f"[{p.subreddit}] {p.title} -> {p.permalink}")

# 2. Watchlist tracking with deduplication
tracker = SubredditTracker()
new_digest = tracker.poll_new_posts(mark_as_seen=True)
print(f"Collected {new_digest.total_posts} new posts.")
```

---

## Module: `gmail`

Specialized in tracking, parsing, and extracting **Substack newsletter emails** via Gmail IMAP for AI agents and periodic briefing generation.

- **Namespace:** `gmail` (accessible via `from gmail import ...`)
- **Protocol:** Secure IMAP over SSL (`imap.gmail.com:993`).

```python
from gmail import fetch_substack_newsletters

digest = fetch_substack_newsletters(limit=5)
for issue in digest.emails:
    print(f"Publication: {issue.sender_name} | Post: {issue.web_url}")
```

---

## Module: `llm_router`

Unified model inference and routing via **OpenRouter**, supporting free and frontier models with automatic environment resolution.

- **Namespace:** `llm_router` (accessible via `from llm_router import ...`)
- **Default Model:** `openrouter/free`

```python
from llm_router import LLMRouter

router = LLMRouter()
response = router.chat([
    {"role": "user", "content": "Hello! What can you help me with today?"}
])

print(response['choices'][0]['message']['content'])
print('Model used:', response['model'])
```

---

## Module: `arxiv`

Provides **semantic, LLM-ready data structures** with **guaranteed links to full articles (HTML & PDF)** and a comprehensive taxonomy of 166 arXiv subcategories across 8 disciplines.

- **Namespace:** `arxiv` (accessible via `from arxiv import ...`)

```python
from arxiv import fetch_newsletter_digest

digest = fetch_newsletter_digest(categories=["cs.AI", "cs.LG"], max_results=3)
prompt = digest.to_llm_prompt()
```
