"""
Gmail module for Daily Bugle.

Specialized in tracking, retrieving, and structuring Substack newsletter emails
via Gmail IMAP for AI agent consumption and newsletter digest pipelines.
"""

from .client import (
    GmailClient,
    fetch_substack_newsletters,
)
from .models import (
    SubstackDigest,
    SubstackEmail,
)

__all__ = [
    "GmailClient",
    "SubstackEmail",
    "SubstackDigest",
    "fetch_substack_newsletters",
]
