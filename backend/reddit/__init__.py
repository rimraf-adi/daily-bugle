"""
Unofficial Reddit module for Daily Bugle.

Provides zero-auth public feed scraping, subreddit watchlist tracking,
post deduplication, keyword filtering, and LLM-ready community pulse digests.
"""

from .crawler import (
    COMMON_SUBREDDIT_ALIASES,
    RedditCrawler,
    create_reddit_digest,
    get_hot_posts,
    normalize_subreddit,
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
    "COMMON_SUBREDDIT_ALIASES",
    "normalize_subreddit",
    "get_hot_posts",
    "create_reddit_digest",
    "track_subreddits",
    "get_tracked_digest",
]

