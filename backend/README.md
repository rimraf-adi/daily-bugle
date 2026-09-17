# Daily Bugle - Backend

A research paper ingestion and newsletter management backend powered by the `uv` package manager and Python 3.13+.

---

## Project Structure

```
backend/
├── .env                   # Local API keys (git-ignored)
├── .env.example           # Configuration template
├── .gitignore
├── .venv/                 # Virtual environment managed by uv
├── pyproject.toml         # Dependencies and project metadata
├── uv.lock                # Deterministic dependency lockfile
├── README.md              # Project documentation (this file)
├── main.py                # Demonstration entrypoint
├── tests/
│   ├── test_arxiv.py      # arXiv ingestion and taxonomy unit tests
│   └── test_llm_router.py # LLM router schema and mock tests
├── arxiv/                 # arXiv Ingestion & Semantic Digest Module
│   ├── __init__.py        # Public API facade
│   ├── categories.py      # Full 166-category taxonomy across all 8 disciplines
│   ├── client.py          # ArxivClient with HTTP query logic and Atom XML parser
│   ├── models.py          # Semantic models (ArxivPaper, PaperLinks, NewsletterDigest)
│   └── README.md          # Module specification for agents & developers
└── llm_router/            # OpenRouter LLM Inference & Routing Module
    ├── __init__.py        # Public API facade
    ├── client.py          # LLMRouter implementation using OpenRouter REST API
    ├── models.py          # ChatMessage, ResponseChoice, UsageInfo, ChatResponse
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
# Edit .env with your OPENROUTER_API_KEY

# Run unit tests
uv run python -m unittest discover -s tests

# Run demonstration script
uv run main.py
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

### Python Usage Example

```python
from llm_router import LLMRouter

router = LLMRouter()

# Send chat request
response = router.chat([
    {"role": "user", "content": "Hello! What can you help me with today?"}
])

# Dict-style access (matches OpenRouter JSON schema)
print(response['choices'][0]['message']['content'])
print('Model used:', response['model'])

# Or convenient object attribute access
print(response.content)
print(response.model)
print("Tokens used:", response.usage.total_tokens)
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

## End-to-End Pipeline: Ingest Papers & Draft Newsletter with OpenRouter

```python
from arxiv import fetch_newsletter_digest
from llm_router import LLMRouter

# 1. Fetch latest breakthroughs across AI, Machine Learning, and NLP
digest = fetch_newsletter_digest(
    categories=["cs.AI", "cs.LG", "cs.CL"],
    max_results=3,
    topic="Daily AI & LLM Morning Briefing",
)

# 2. Route prompt to OpenRouter to write the newsletter draft
router = LLMRouter()
newsletter = router.generate_newsletter(digest)

print(f"--- Generated via {newsletter.model} ---")
print(newsletter.content)
```
