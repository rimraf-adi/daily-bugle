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

# Run the entrypoint
uv run main.py
```

## Modules

### `arxiv`
The `arxiv` module provides utilities to search and fetch research papers from the official arXiv API.

```python
from arxiv import search_papers, fetch_recent_papers

# Search papers by topic
papers = search_papers("quantum computing", max_results=5)

# Fetch recent AI papers
ai_papers = fetch_recent_papers(category="cs.AI", max_results=5)

for paper in ai_papers:
    print(f"[{paper.arxiv_id}] {paper.title} by {', '.join(paper.authors)}")
```
