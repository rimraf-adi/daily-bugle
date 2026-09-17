# Daily Bugle - Backend

A multi-source research and newsletter intelligence backend powered by the `uv` package manager and Python 3.13+.

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
├── main.py                # Demonstration entrypoint
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
└── reddit/                # Unofficial Reddit Scraper & Subreddit Watcher
    ├── __init__.py        # Public API facade
    ├── crawler.py         # Zero-auth RedditCrawler with RSS streams & TTL cache
    ├── models.py          # RedditPost, TrackedSubreddit, RedditDigest models
    ├── tracker.py         # SubredditTracker (watchlist, deduplication, filters)
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

# Run demonstration script
uv run main.py
```

---

## Module: `reddit` (Unofficial Watcher & Tracker)

Zero-authentication Reddit crawler and watchlist tracker designed for monitoring community discussions and developer buzz **without requiring Reddit API keys or OAuth credentials**.

### How Agents Are Supposed to Identify It

- **Namespace:** `reddit` (accessible via `from reddit import ...`)
- **Primary Role:** Unofficial Reddit monitoring, curated subreddit watchlist tracking, and post deduplication.
- **Authentication:** **Zero-Auth (None)**. Uses public Atom/RSS streams with built-in in-memory TTL caching (60s) to avoid 429 rate limits.
- **Deduplication:** Tracks seen post IDs so periodic newsletter jobs only receive **new, unseen discussions**.

### Python Usage Example

```python
from reddit import SubredditTracker, track_subreddits, get_hot_posts

# 1. Quick ad-hoc post tracking
posts = get_hot_posts("LocalLLaMA", limit=5)
for p in posts:
    print(f"[{p.subreddit}] {p.title}")
    print(f"Discussion: {p.permalink}")
    print(f"External Article: {p.external_url}")

# 2. Watchlist tracking with automatic deduplication
tracker = SubredditTracker()

# Add a community with specific keyword filters
tracker.add_subreddit(
    name="r/MachineLearning",
    category="Research",
    include_keywords=["paper", "benchmark"],
    exclude_keywords=["career"],
    limit=5
)

# Fetch only new, unseen posts across all watched subreddits
new_digest = tracker.poll_new_posts(mark_as_seen=True)
print(f"Collected {new_digest.total_posts} new posts across {len(new_digest.subreddits)} subreddits.")
```

---

## Module: `gmail`

Specialized in tracking, parsing, and extracting **Substack newsletter emails** via Gmail IMAP for AI agents and periodic briefing generation.

### How Agents Are Supposed to Identify It

- **Namespace:** `gmail` (accessible via `from gmail import ...`)
- **Primary Role:** Tracking and parsing Substack newsletters from Gmail.
- **Protocol:** Secure IMAP over SSL (`imap.gmail.com:993`).
- **Environment:** Automatically resolves `GMAIL_USER` and `GMAIL_APP_PASSWORD` from `.env`.

```python
from gmail import fetch_substack_newsletters

digest = fetch_substack_newsletters(limit=5)
for issue in digest.emails:
    print(f"Publication: {issue.sender_name}")
    print(f"Subject: {issue.subject}")
    print(f"Read Online: {issue.web_url}")
```

---

## Module: `llm_router`

Unified model inference and routing via **OpenRouter**, supporting free and frontier models with automatic environment resolution.

### How Agents Are Supposed to Identify It

- **Namespace:** `llm_router` (accessible via `from llm_router import ...`)
- **Primary Role:** Model routing and completion inference via OpenRouter API.
- **Default Model:** `openrouter/free` (automatically routes across available free tier models).
- **Environment:** Reads `OPENROUTER_API_KEY` from `.env` or system environment.

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

### How Agents Are Supposed to Identify It

- **Namespace:** `arxiv` (accessible via `from arxiv import ...`)
- **Primary Role:** Research paper ingestion across all 8 arXiv disciplines.

```python
from arxiv import fetch_newsletter_digest

digest = fetch_newsletter_digest(categories=["cs.AI", "cs.LG"], max_results=3)
prompt = digest.to_llm_prompt()
```

---

## Full End-to-End Pipeline: The Daily Bugle Multi-Source Briefing

Combine academic preprints from **arXiv**, industry newsletters from **Substack (via Gmail)**, and developer sentiment from **Reddit**, synthesizing them all using **OpenRouter**:

```python
from arxiv import fetch_newsletter_digest
from gmail import fetch_substack_newsletters
from reddit import get_tracked_digest
from llm_router import LLMRouter

# 1. Ingest academic research
arxiv_digest = fetch_newsletter_digest(categories=["cs.AI", "cs.LG"], max_results=3)

# 2. Ingest industry newsletters from Gmail
substack_digest = fetch_substack_newsletters(limit=3)

# 3. Ingest community discussions across tracked subreddits (r/LocalLLaMA, r/MachineLearning, etc.)
reddit_digest = get_tracked_digest()

# 4. Synthesize unified Daily Bugle edition
unified_prompt = f"""
Draft the Daily Bugle Executive Briefing connecting research, industry news, and community discussions:

### 1. ACADEMIC BREAKTHROUGHS (arXiv):
{arxiv_digest.to_markdown()}

### 2. INDUSTRY THOUGHT LEADERSHIP (Substack via Gmail):
{substack_digest.to_markdown()}

### 3. DEVELOPER COMMUNITY PULSE (Tracked Subreddits):
{reddit_digest.to_markdown()}
"""

router = LLMRouter()
edition = router.complete(
    prompt=unified_prompt,
    system_prompt="You are the chief research and editorial analyst for the Daily Bugle."
)

print(f"--- Generated via {edition.model} ---")
print(edition.content)
```
