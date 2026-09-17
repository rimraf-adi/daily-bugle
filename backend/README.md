# Daily Bugle - Backend

This backend service manages article and paper ingestion for Daily Bugle using the `uv` package manager.

## Prerequisites

- Python 3.13+
- [uv](https://github.com/astral-sh/uv) package manager

## Quickstart

```bash
# Navigate to the backend directory
cd backend

# Sync dependencies and set up the virtual environment
uv sync

# Run the demonstration entrypoint
uv run main.py

# Run unit tests
uv run python -m unittest discover -s tests
```

## Modules

### `arxiv`
The `arxiv` module provides semantic, LLM-ready data structures and fetching utilities for building periodic newsletter updates.

#### 1. Fetching a Newsletter Digest
```python
from arxiv import fetch_newsletter_digest

# Fetch latest papers across key categories (e.g. AI, ML, NLP)
digest = fetch_newsletter_digest(
    categories=["cs.AI", "cs.LG", "cs.CL"],
    max_results=5,
    topic="Daily AI & LLM Breakthroughs",
)

# Ready-to-use LLM prompt with direct article links for drafting the newsletter
prompt_for_llm = digest.to_llm_prompt()

# Token-efficient dictionary payload for LLMs
llm_payload = digest.to_llm_payload()

# Export full JSON
print(digest.to_json(indent=2))
```

#### 2. Semantic Paper Data Model
Each `ArxivPaper` contains:
- `arxiv_id`: Clean paper identifier (e.g. `2403.12345v1`)
- `title`: Sanitized title
- `abstract`: Full sanitized abstract
- `authors`: List of author names
- `published` & `updated`: ISO 8601 timestamps
- `primary_category` & `primary_category_name`: Canonical category code and human-readable topic name
- `categories` & `category_names`: All mapped topic classifications
- `links`:
  - `html`: Direct web HTML full-text link (`https://arxiv.org/html/{id}`)
  - `pdf`: Direct PDF download link (`https://arxiv.org/pdf/{id}.pdf`)
  - `abstract`: Abstract landing page (`https://arxiv.org/abs/{id}`)
  - `full_article`: Preferred link for full article reading
- `comment`, `journal_ref`, `doi`: Associated publication metadata

#### Output Formats:
- `.to_dict()`: Clean dictionary.
- `.to_json()`: Standard JSON string.
- `.to_llm_context()`: Token-optimized dictionary designed specifically for LLM prompt context injection.
- `.to_markdown()`: Markdown block with clickable full-article links.

#### 3. Complete arXiv Taxonomy & Search (166 Categories)
The module includes the full arXiv taxonomy spanning all 8 core disciplines (Physics, Math, Computer Science, Quantitative Biology, Quantitative Finance, Statistics, EESS, Economics):

```python
from arxiv import (
    CATEGORY_MAP,
    SUBJECT_TAXONOMY,
    get_category_name,
    search_categories,
    get_categories_by_subject,
    list_subjects,
)

# Search categories by keyword
matches = search_categories("quantum")
# e.g., {'quant-ph': 'Quantum Physics', 'cond-mat.quant-gas': 'Quantum Gases', 'math.QA': 'Quantum Algebra'}

# Get all categories for a subject
econ_cats = get_categories_by_subject("Economics")
# {'econ.EM': 'Econometrics', 'econ.GN': 'General Economics', 'econ.TH': 'Theoretical Economics'}

# Look up human-readable name
name = get_category_name("astro-ph.CO")
# 'Cosmology and Nongalactic Astrophysics'
```

