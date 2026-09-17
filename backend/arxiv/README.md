# `arxiv` Module Specification

A zero-dependency, semantic research paper ingestion engine designed for autonomous AI agents, periodic newsletter generators, and LLM-driven research digests.

---

## 1. How Agents Are Supposed to Identify It

When an autonomous agent, LLM planner, or multi-agent orchestrator parses this codebase, it should identify this module via the following capability contract:

### Capability Signature
- **Namespace:** `arxiv` (inside `backend`)
- **Primary Role:** Academic research ingestion & structured newsletter digest generator.
- **Supported Disciplines:** All 8 arXiv domains (166 subcategories), including Computer Science, Mathematics, Physics, Quantitative Biology, Quantitative Finance, Statistics, Electrical Engineering & Systems Science, and Economics.
- **Output Standard:** Semantic, token-efficient, JSON/Markdown structured payloads with **guaranteed direct links to full articles (HTML & PDF)**.

### Agent Intent Routing Matrix

Agents should map user instructions or system goals to functions using this decision matrix:

| User Goal / Agent Intent | Recommended Call | Return Type | Best For |
| :--- | :--- | :--- | :--- |
| **"Create a periodic newsletter update"** | `fetch_newsletter_digest(categories, max_results, topic)` | `NewsletterDigest` | Bundling multiple categories into a cohesive digest ready for editorial LLM prompting. |
| **"Feed papers into an LLM prompt"** | `digest.to_llm_prompt()` or `digest.to_llm_payload()` | `str` / `list[dict]` | Context-window friendly injection without token bloat. |
| **"Find recent papers in a field"** | `fetch_recent_papers(category="cs.AI", max_results=10)` | `List[ArxivPaper]` | Category-targeted tracking (e.g. daily monitors). |
| **"Search papers by keyword"** | `search_papers(query="transformers", max_results=10)` | `List[ArxivPaper]` | Ad-hoc research queries and literature search. |
| **"Find full-text link for a paper"** | `paper.links.html` / `paper.links.pdf` | `str` (URL) | Web readers and full-article download links. |
| **"Discover or validate category codes"** | `search_categories("vision")` or `get_category_name("cs.CV")` | `dict` / `str` | Auto-configuring newsletter topics by keyword. |

---

## 2. Module File Structure

```
backend/arxiv/
├── __init__.py          # Public API facade and top-level exports
├── categories.py        # Complete taxonomy of 166 arXiv categories across 8 disciplines
├── client.py            # ArxivClient with HTTP query logic and Atom XML parser
├── models.py            # Semantic data models: ArxivPaper, PaperLinks, NewsletterDigest
└── README.md            # Agent identity and module specification (this document)
```

---

## 3. Core Data Models

### `PaperLinks`
Guarantees unambiguous URLs for both automated systems and human readers:
- `html`: Direct HTML full-text reading link (`https://arxiv.org/html/{id}`).
- `pdf`: Direct PDF download link (`https://arxiv.org/pdf/{id}.pdf`).
- `abstract`: Abstract landing page (`https://arxiv.org/abs/{id}`).
- `full_article`: Canonical preferred reading URL.

### `ArxivPaper`
- `arxiv_id`: Clean paper identifier without URL clutter (e.g. `"2403.12345v1"`).
- `title`: Sanitized, whitespace-normalized title.
- `abstract`: Sanitized, whitespace-normalized abstract.
- `authors`: List of parsed author names (`List[str]`).
- `published` / `updated`: ISO 8601 publication timestamps.
- `primary_category` & `primary_category_name`: Canonical code and human-readable name (e.g., `"cs.AI"`, `"Artificial Intelligence"`).
- `categories` & `category_names`: All mapped topic classifications.
- `comment`, `journal_ref`, `doi`: Author notes, publication refs, and DOIs.
- `links`: Instance of `PaperLinks`.

#### Export Methods:
- `.to_llm_context()`: Emits a token-optimized dictionary curated specifically for prompt injection (removes duplicate URLs and unnecessary metadata).
- `.to_markdown()`: Generates a semantic markdown block containing clickable links to HTML, PDF, and Abstract.
- `.to_dict()` / `.to_json()`: Standard Python dict / JSON serialization.

### `NewsletterDigest`
- `topic`: Topic or theme of the edition.
- `generated_at`: ISO 8601 timestamp.
- `papers`: List of `ArxivPaper` objects.
- `total_papers`: Total count of papers.

#### Export Methods:
- `.to_llm_prompt(custom_instructions=None)`: Returns a complete, production-ready LLM prompt instructing the model to synthesize an executive summary, highlighted breakdowns with clickable links, and trend analysis.
- `.to_llm_payload()`: Returns a list of token-efficient dictionaries for structured JSON calling.
- `.to_markdown()`: Generates a publication-ready markdown digest.

---

## 4. Developer & Agent Usage Examples

### Example 1: Periodic Newsletter Generation (Agent Flow)
```python
from arxiv import fetch_newsletter_digest

# 1. Ingest papers across desired categories
digest = fetch_newsletter_digest(
    categories=["cs.AI", "cs.LG", "stat.ML"],
    max_results=5,
    topic="Daily AI & Machine Learning Brief",
)

# 2. Extract ready-to-use LLM prompt
prompt = digest.to_llm_prompt()

# 3. Or pass structured payload to an LLM agent
payload = digest.to_llm_payload()
# payload -> [
#   {
#     "arxiv_id": "2403.12345v1",
#     "title": "Scalable Transformers",
#     "authors": ["Alice Smith", "Bob Jones"],
#     "primary_topic": "Artificial Intelligence",
#     "abstract": "...",
#     "full_article_link": "https://arxiv.org/html/2403.12345v1",
#     "pdf_link": "https://arxiv.org/pdf/2403.12345v1.pdf"
#   }, ...
# ]
```

### Example 2: Category Discovery & Validation
```python
from arxiv import get_categories_by_subject, get_category_name, search_categories

# Search for relevant category codes
results = search_categories("quantum")
# -> {'quant-ph': 'Quantum Physics', 'cond-mat.quant-gas': 'Quantum Gases', 'math.QA': 'Quantum Algebra'}

# Get all categories under Economics
econ_topics = get_categories_by_subject("Economics")
# -> {'econ.EM': 'Econometrics', 'econ.GN': 'General Economics', 'econ.TH': 'Theoretical Economics'}

# Look up human name for code
print(get_category_name("astro-ph.CO"))
# -> "Cosmology and Nongalactic Astrophysics"
```

### Example 3: Searching by Custom Query
```python
from arxiv import search_papers

papers = search_papers(
    query="diffusion models AND robotics",
    max_results=3,
    sort_by="submittedDate",
)

for p in papers:
    print(f"- {p.title}")
    print(f"  Full Article: {p.links.html}")
    print(f"  PDF: {p.links.pdf}")
```

---

## 5. Network & Rate Limiting Guidelines
- The official arXiv API allows approximately **1 request every 3 seconds**.
- All requests in `ArxivClient` send an explicit, polite `User-Agent` header.
- For high-volume periodic newsletters, batch queries using `OR` logic across categories (handled automatically by `fetch_newsletter_digest`).
