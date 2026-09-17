"""
arXiv module for Daily Bugle.

Provides semantic, LLM-ready data structures, fetching utilities, and complete
category taxonomies across all 8 arXiv disciplines.
"""

from .categories import (
    CATEGORY_MAP,
    SUBJECT_TAXONOMY,
    get_categories_by_subject,
    get_category_name,
    list_subjects,
    normalize_arxiv_query,
    search_categories,
)
from .client import (
    ArxivClient,
    fetch_newsletter_digest,
    fetch_recent_papers,
    search_papers,
)
from .models import (
    ArxivPaper,
    NewsletterDigest,
    PaperLinks,
)

__all__ = [
    "ArxivClient",
    "ArxivPaper",
    "PaperLinks",
    "NewsletterDigest",
    "CATEGORY_MAP",
    "SUBJECT_TAXONOMY",
    "get_category_name",
    "search_categories",
    "get_categories_by_subject",
    "list_subjects",
    "normalize_arxiv_query",
    "fetch_newsletter_digest",
    "fetch_recent_papers",
    "search_papers",
]

