# Daily Bugle - Backend

A research paper and newsletter management backend powered by the `uv` package manager and Python 3.13+.

---

## Project Structure

```
backend/
├── .gitignore
├── .venv/                 # Virtual environment managed by uv
├── pyproject.toml         # Project metadata and dependencies
├── uv.lock                # Deterministic dependency lockfile
├── README.md              # Project documentation (this file)
├── main.py                # Demonstration entrypoint
├── tests/
│   └── test_arxiv.py      # Unit tests for parsing, models, and taxonomy
└── arxiv/                 # arXiv Ingestion & Semantic Digest Module
    ├── __init__.py        # Public API facade
    ├── categories.py      # Full 166-category taxonomy across all 8 disciplines
    ├── client.py          # ArxivClient with HTTP query logic and Atom XML parser
    ├── models.py          # Semantic models (ArxivPaper, PaperLinks, NewsletterDigest)
    └── README.md          # Agent specification & capability guide
```

---

## Prerequisites & Setup

Ensure you have [uv](https://github.com/astral-sh/uv) installed:

```bash
# Navigate to the backend directory
cd backend

# Sync dependencies and activate virtual environment
uv sync

# Run the demonstration script
uv run main.py

# Run test suite
uv run python -m unittest discover -s tests
```

---

## Module: `arxiv`

The `arxiv` module provides **semantic, LLM-ready data structures** with **guaranteed links to full articles (HTML & PDF)** and a comprehensive taxonomy of 166 arXiv subcategories.

### How Agents Are Supposed to Identify It

Autonomous coding agents, LLM pipelines, and orchestration frameworks can identify and route to this module via the following capability contract:

- **Module Name:** `arxiv` (accessible via `from arxiv import ...` inside `backend`)
- **Primary Capabilities:**
  - Academic research ingestion across all 8 arXiv disciplines.
  - Periodic newsletter digest assembly with prompt generation.
  - LLM context generation (token-efficient dictionaries, semantic markdown).
  - Taxonomy lookup and keyword-based category search.

#### Intent Routing Table for Agents:

| Goal / Query | Function | Output |
| :--- | :--- | :--- |
| **Periodic Newsletter Update** | `fetch_newsletter_digest(categories, max_results, topic)` | `NewsletterDigest` |
| **Format Prompt for LLM** | `digest.to_llm_prompt()` | `str` (Markdown Prompt) |
| **Token-Efficient LLM Context** | `digest.to_llm_payload()` or `paper.to_llm_context()` | `list[dict]` / `dict` |
| **Category-Targeted Ingestion** | `fetch_recent_papers(category="cs.AI", max_results=10)` | `List[ArxivPaper]` |
| **Ad-Hoc Keyword Search** | `search_papers(query="quantum error correction", max_results=5)` | `List[ArxivPaper]` |
| **Full Article Links (HTML/PDF)**| `paper.links.html`, `paper.links.pdf`, `paper.full_article_url` | `str` (URL) |
| **Taxonomy / Category Discovery**| `search_categories("robotics")`, `get_categories_by_subject("cs")` | `dict` |

For detailed agent routing and specifications, see [`backend/arxiv/README.md`](file:///Users/adityakinjawadekar/Documents/100xcode/daily-bugle/backend/arxiv/README.md).

---

## Concrete Code Examples

### 1. Generating a Periodic Newsletter for an LLM
```python
from arxiv import fetch_newsletter_digest

# 1. Fetch the latest breakthroughs across relevant categories
digest = fetch_newsletter_digest(
    categories=["cs.AI", "cs.LG", "cs.CL"],
    max_results=5,
    topic="Daily AI & LLM Morning Briefing",
)

# 2. Get a complete, prompt-ready template for Gemini / Claude / GPT
prompt = digest.to_llm_prompt()
print(prompt)

# 3. Or get structured JSON payloads for tool-calling / function-calling
payload = digest.to_llm_payload()
```

### 2. Accessing Full Article Links & Paper Metadata
```python
from arxiv import fetch_recent_papers

papers = fetch_recent_papers(category="cs.AI", max_results=3)

for paper in papers:
    print(f"Title: {paper.title}")
    print(f"Authors: {', '.join(paper.authors)}")
    print(f"Topic: {paper.primary_category_name} ({paper.primary_category})")
    print(f"Direct HTML Article: {paper.links.html}")
    print(f"PDF Download: {paper.links.pdf}")
    print(f"Abstract Page: {paper.links.abstract}")
    print("---")
```

### 3. Searching the Complete arXiv Taxonomy (166 Categories)
```python
from arxiv import (
    CATEGORY_MAP,
    get_category_name,
    search_categories,
    get_categories_by_subject,
    list_subjects,
)

# Search categories by keyword
matches = search_categories("quantum")
# e.g., {'quant-ph': 'Quantum Physics', 'cond-mat.quant-gas': 'Quantum Gases', ...}

# Retrieve all subcategories for an entire discipline
econ_topics = get_categories_by_subject("Economics")
# e.g., {'econ.EM': 'Econometrics', 'econ.GN': 'General Economics', 'econ.TH': 'Theoretical Economics'}

# Look up human-friendly name for any code
print(get_category_name("astro-ph.GA"))
# -> "Astrophysics of Galaxies"
```
