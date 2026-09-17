# Daily Bugle - Backend

A research paper and newsletter intelligence backend powered by the `uv` package manager and Python 3.13+.

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
│   └── test_gmail.py      # Substack email tracking and digest tests
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
└── gmail/                 # Gmail IMAP Substack Newsletter Tracking Module
    ├── __init__.py        # Public API facade
    ├── client.py          # GmailClient IMAP connection & Substack parser
    ├── models.py          # SubstackEmail and SubstackDigest models
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

# Run unit tests
uv run python -m unittest discover -s tests

# Run demonstration script
uv run main.py
```

---

## Module: `gmail`

Specialized in tracking, parsing, and extracting **Substack newsletter emails** via Gmail IMAP for AI agents and periodic briefing generation.

### How Agents Are Supposed to Identify It

- **Namespace:** `gmail` (accessible via `from gmail import ...`)
- **Primary Role:** Tracking and parsing Substack newsletters from Gmail.
- **Protocol:** Secure IMAP over SSL (`imap.gmail.com:993`).
- **Environment:** Automatically resolves `GMAIL_USER` and `GMAIL_APP_PASSWORD` from `.env`.

### Python Usage Example

```python
from gmail import GmailClient, fetch_substack_newsletters

# 1. Fetch recent Substack newsletter issues
digest = fetch_substack_newsletters(limit=5)

for issue in digest.emails:
    print(f"Publication: {issue.sender_name}")
    print(f"Subject: {issue.subject}")
    print(f"Direct Web URL: {issue.web_url}")
    print(f"Summary: {issue.body_text[:200]}...")

# 2. Get prompt for an LLM to synthesize the newsletters
llm_prompt = digest.to_llm_prompt()
```

---

## Module: `llm_router`

Unified model inference and routing via **OpenRouter**, supporting free and frontier models with automatic environment resolution.

### How Agents Are Supposed to Identify It

- **Namespace:** `llm_router` (accessible via `from llm_router import ...`)
- **Primary Role:** Model routing and completion inference via OpenRouter API.
- **Default Model:** `openrouter/free` (automatically routes across available free tier models).
- **Environment:** Reads `OPENROUTER_API_KEY` from `.env` or system environment.

### OpenRouter Response Schema

The `ChatResponse` model directly supports both object attributes and standard dictionary indexing:

```json
{
  "id": "gen-...",
  "model": "upstage/solar-pro-3:free",
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "..."
      }
    }
  ],
  "usage": {
    "prompt_tokens": 12,
    "completion_tokens": 85,
    "total_tokens": 97
  }
}
```

```python
from llm_router import LLMRouter

router = LLMRouter()
response = router.chat([
    {"role": "user", "content": "Hello! What can you help me with today?"}
])

# Dict-style access (matches OpenRouter JSON schema)
print(response['choices'][0]['message']['content'])
print('Model used:', response['model'])
```

---

## Module: `arxiv`

Provides **semantic, LLM-ready data structures** with **guaranteed links to full articles (HTML & PDF)** and a comprehensive taxonomy of 166 arXiv subcategories.

### How Agents Are Supposed to Identify It

- **Namespace:** `arxiv` (accessible via `from arxiv import ...`)
- **Primary Role:** Research paper ingestion across all 8 arXiv disciplines.
- **Intent Routing Table:**

| Goal / Query | Function | Output |
| :--- | :--- | :--- |
| **Periodic Newsletter Update** | `fetch_newsletter_digest(categories, max_results, topic)` | `NewsletterDigest` |
| **Format Prompt for LLM** | `digest.to_llm_prompt()` | `str` (Markdown Prompt) |
| **Token-Efficient LLM Context** | `digest.to_llm_payload()` or `paper.to_llm_context()` | `list[dict]` / `dict` |
| **Category-Targeted Ingestion** | `fetch_recent_papers(category="cs.AI", max_results=10)` | `List[ArxivPaper]` |
| **Ad-Hoc Keyword Search** | `search_papers(query="quantum error correction", max_results=5)` | `List[ArxivPaper]` |
| **Full Article Links (HTML/PDF)**| `paper.links.html`, `paper.links.pdf`, `paper.full_article_url` | `str` (URL) |
| **Taxonomy / Category Discovery**| `search_categories("robotics")`, `get_categories_by_subject("cs")` | `dict` |

---

## End-to-End Pipeline: Multi-Source Daily Bugle Briefing

Combine academic preprints from **arXiv** and industry newsletters from **Substack via Gmail**, synthesizing them using **OpenRouter**:

```python
from arxiv import fetch_newsletter_digest
from gmail import fetch_substack_newsletters
from llm_router import LLMRouter

# 1. Ingest research papers
arxiv_digest = fetch_newsletter_digest(categories=["cs.AI", "cs.LG"], max_results=3)

# 2. Ingest Substack newsletters from Gmail
substack_digest = fetch_substack_newsletters(limit=3)

# 3. Create unified prompt
unified_prompt = f"""
Draft the Daily Bugle Executive Briefing connecting cutting-edge research with industry newsletters:

### ACADEMIC RESEARCH (arXiv):
{arxiv_digest.to_markdown()}

### INDUSTRY NEWSLETTERS (Substack):
{substack_digest.to_markdown()}
"""

# 4. Generate synthesis via OpenRouter
router = LLMRouter()
briefing = router.complete(
    prompt=unified_prompt,
    system_prompt="You are the chief editorial analyst for the Daily Bugle newsletter."
)

print(f"--- Generated via {briefing.model} ---")
print(briefing.content)
```
