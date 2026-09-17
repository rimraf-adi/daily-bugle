from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Union

from .crawler import RedditCrawler, default_crawler
from .models import RedditDigest, RedditPost, TrackedSubreddit

DEFAULT_CURATED_WATCHLIST: List[Dict[str, Any]] = [
    {
        "name": "LocalLLaMA",
        "category": "Open Source AI & LLMs",
        "listing": "hot",
        "limit": 5,
        "include_keywords": [],
        "exclude_keywords": [],
    },
    {
        "name": "MachineLearning",
        "category": "Research & Benchmarks",
        "listing": "hot",
        "limit": 5,
        "include_keywords": [],
        "exclude_keywords": [],
    },
    {
        "name": "artificial",
        "category": "Industry & Applications",
        "listing": "hot",
        "limit": 3,
        "include_keywords": [],
        "exclude_keywords": [],
    },
    {
        "name": "singularity",
        "category": "Frontier Tech & AGI",
        "listing": "hot",
        "limit": 3,
        "include_keywords": [],
        "exclude_keywords": [],
    },
    {
        "name": "technology",
        "category": "General Tech News",
        "listing": "hot",
        "limit": 3,
        "include_keywords": [],
        "exclude_keywords": [],
    },
]


class SubredditTracker:
    """
    Subreddit Watcher & Tracker for Daily Bugle.
    Manages curated watchlist, post deduplication (seen IDs), keyword filtering, and digest assembly.
    """

    def __init__(
        self,
        crawler: Optional[RedditCrawler] = None,
        state_file: Optional[Union[str, Path]] = None,
    ):
        self.crawler = crawler or default_crawler
        self.state_file = Path(state_file) if state_file else None
        self._watchlist: Dict[str, TrackedSubreddit] = {}
        self._seen_ids: Set[str] = set()

        self._load_state()

    def _load_state(self) -> None:
        """Load watchlist and seen post history from file, or initialize with curated defaults."""
        if self.state_file and self.state_file.is_file():
            try:
                with open(self.state_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for item in data.get("watchlist", []):
                        sub = TrackedSubreddit.from_dict(item)
                        self._watchlist[sub.clean_name.lower()] = sub
                    self._seen_ids = set(data.get("seen_ids", []))
                    return
            except Exception:
                pass

        # Fallback to curated defaults
        for item in DEFAULT_CURATED_WATCHLIST:
            sub = TrackedSubreddit.from_dict(item)
            self._watchlist[sub.clean_name.lower()] = sub

    def save_state(self) -> None:
        """Persist watchlist and pruned seen IDs to disk if state_file is configured."""
        if not self.state_file:
            return

        try:
            self.state_file.parent.mkdir(parents=True, exist_ok=True)
            # Prune seen_ids to last 1500 to keep state file light
            pruned_seen = list(self._seen_ids)[-1500:]
            data = {
                "watchlist": [sub.to_dict() for sub in self._watchlist.values()],
                "seen_ids": pruned_seen,
            }
            with open(self.state_file, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
        except Exception:
            pass

    def add_subreddit(
        self,
        name: str,
        category: str = "General",
        listing: str = "hot",
        time_filter: str = "day",
        limit: int = 5,
        include_keywords: Optional[List[str]] = None,
        exclude_keywords: Optional[List[str]] = None,
    ) -> TrackedSubreddit:
        """Add or update a subreddit in the watchlist."""
        sub = TrackedSubreddit(
            name=name,
            category=category,
            listing=listing,
            time_filter=time_filter,
            limit=limit,
            include_keywords=include_keywords or [],
            exclude_keywords=exclude_keywords or [],
            enabled=True,
        )
        self._watchlist[sub.clean_name.lower()] = sub
        self.save_state()
        return sub

    def remove_subreddit(self, name: str) -> bool:
        """Remove a subreddit from the watchlist."""
        clean = name.replace("r/", "").strip().lower()
        if clean in self._watchlist:
            del self._watchlist[clean]
            self.save_state()
            return True
        return False

    def list_watchlist(self, enabled_only: bool = True) -> List[TrackedSubreddit]:
        """Return all tracked subreddits."""
        subs = list(self._watchlist.values())
        if enabled_only:
            return [s for s in subs if s.enabled]
        return subs

    def set_enabled(self, name: str, enabled: bool) -> bool:
        """Enable or disable tracking for a subreddit."""
        clean = name.replace("r/", "").strip().lower()
        if clean in self._watchlist:
            self._watchlist[clean].enabled = enabled
            self.save_state()
            return True
        return False

    def poll_new_posts(self, mark_as_seen: bool = True) -> RedditDigest:
        """
        Scan all tracked subreddits for NEW posts that have not been seen in prior runs.
        Ideal for automated periodic newsletter jobs.
        """
        new_posts: List[RedditPost] = []
        scanned_subs: List[str] = []

        for sub in self.list_watchlist(enabled_only=True):
            scanned_subs.append(sub.display_name)
            try:
                posts = self.crawler.get_posts(
                    subreddit=sub.clean_name,
                    listing=sub.listing,
                    limit=sub.limit * 2,  # Fetch slightly more to account for seen deduplication
                    time_filter=sub.time_filter,
                )

                matching_unseen = []
                for p in posts:
                    if p.id in self._seen_ids:
                        continue
                    if sub.matches(p):
                        matching_unseen.append(p)
                        if mark_as_seen:
                            self._seen_ids.add(p.id)
                    if len(matching_unseen) >= sub.limit:
                        break

                new_posts.extend(matching_unseen)
            except Exception:
                pass

        if mark_as_seen:
            self.save_state()

        return RedditDigest(subreddits=scanned_subs, posts=new_posts)

    def get_trending_digest(self, limit_per_sub: Optional[int] = None) -> RedditDigest:
        """
        Fetch hot/trending posts across all tracked subreddits regardless of seen status.
        Useful for generating on-demand or snapshot newsletter editions.
        """
        all_posts: List[RedditPost] = []
        scanned_subs: List[str] = []

        for sub in self.list_watchlist(enabled_only=True):
            scanned_subs.append(sub.display_name)
            limit = limit_per_sub or sub.limit
            try:
                posts = self.crawler.get_posts(
                    subreddit=sub.clean_name,
                    listing=sub.listing,
                    limit=limit,
                    time_filter=sub.time_filter,
                )
                filtered = [p for p in posts if sub.matches(p)][:limit]
                all_posts.extend(filtered)
            except Exception:
                pass

        return RedditDigest(subreddits=scanned_subs, posts=all_posts)

    def is_seen(self, post_id: str) -> bool:
        """Check if a post has already been recorded as seen."""
        return post_id in self._seen_ids

    def mark_seen(self, post_id: str) -> None:
        """Manually mark a post ID as seen."""
        self._seen_ids.add(post_id)
        self.save_state()

    def reset_seen(self) -> None:
        """Clear seen post history."""
        self._seen_ids.clear()
        self.save_state()


default_tracker = SubredditTracker()


def track_subreddits(mark_as_seen: bool = True) -> RedditDigest:
    """Fetch new unseen posts across all tracked subreddits using default tracker."""
    return default_tracker.poll_new_posts(mark_as_seen=mark_as_seen)


def get_tracked_digest() -> RedditDigest:
    """Fetch trending digest across all tracked subreddits using default tracker."""
    return default_tracker.get_trending_digest()
