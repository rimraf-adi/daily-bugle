"""
arXiv module for Daily Bugle.

Provides semantic, LLM-ready data structures and fetching utilities for research papers,
tailored for building newsletter managers and periodic digest updates.
"""

from .client import (
    ArxivClient,
    fetch_newsletter_digest,
    fetch_recent_papers,
    search_papers,
)
from .models import (
    CATEGORY_MAP,
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
    "fetch_newsletter_digest",
    "fetch_recent_papers",
    "search_papers",
]
