"""
arXiv module for Daily Bugle.

Provides tools for fetching, searching, and parsing scientific preprints from arXiv.
"""

from .client import (
    ArxivClient,
    ArxivPaper,
    fetch_recent_papers,
    search_papers,
)

__all__ = [
    "ArxivClient",
    "ArxivPaper",
    "fetch_recent_papers",
    "search_papers",
]
