"""
Unofficial Reddit module for Daily Bugle.

Provides zero-auth public feed scraping, subreddit watchlist tracking,
post deduplication, keyword filtering, and LLM-ready community pulse digests.
"""

from .crawler import (
    RedditCrawler,
    create_reddit_digest,
    get_hot_posts,
)
from .models import (
    RedditDigest,
    RedditPost,
    TrackedSubreddit,
)
from .tracker import (
    SubredditTracker,
    get_tracked_digest,
    track_subreddits,
)

__all__ = [
    "RedditCrawler",
    "RedditPost",
    "RedditDigest",
    "TrackedSubreddit",
    "SubredditTracker",
    "get_hot_posts",
    "create_reddit_digest",
    "track_subreddits",
    "get_tracked_digest",
]
