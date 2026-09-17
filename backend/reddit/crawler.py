from __future__ import annotations

import re
import time
import urllib.parse
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from typing import Any, Dict, List, Optional, Tuple, Union

import requests

from .models import RedditDigest, RedditPost

ATOM_NS = {"atom": "http://www.w3.org/2005/Atom"}


class _RedditHTMLCleaner(HTMLParser):
    """Parses Reddit's Atom content HTML to extract submitted external links and clean selftext."""
    def __init__(self):
        super().__init__()
        self.text_chunks: List[str] = []
        self.external_url: Optional[str] = None
        self._current_href: Optional[str] = None

    def handle_starttag(self, tag: str, attrs: List[Tuple[str, Optional[str]]]):
        if tag.lower() == "a":
            for k, v in attrs:
                if k.lower() == "href" and v:
                    self._current_href = v
                    # Reddit RSS marks the external link with text '[link]'
                    # or links not pointing to reddit.com / user profiles
                    if not self.external_url and "reddit.com" not in v and v.startswith("http"):
                        self.external_url = v

    def handle_endtag(self, tag: str):
        if tag.lower() == "a":
            self._current_href = None

    def handle_data(self, data: str):
        # Check if anchor text is '[link]' and href is present
        if data.strip() == "[link]" and self._current_href:
            self.external_url = self._current_href
        # Skip internal reddit boilerplate links in RSS content
        elif data.strip() in ["[comments]", "submitted by", "[link]"]:
            pass
        else:
            self.text_chunks.append(data)

    def get_clean_text(self) -> str:
        raw = " ".join("".join(self.text_chunks).split())
        # Clean up repeated boilerplate
        raw = re.sub(r"/u/[a-zA-Z0-9_\-]+", "", raw)
        return raw.strip()


class RedditCrawler:
    """
    Unofficial Reddit crawler and watcher without API keys.
    Uses public Atom/RSS streams with built-in TTL caching and rate-limit politeness.
    """

    DEFAULT_USER_AGENT = "DailyBugleCrawler/1.0 (contact: bot@dailybugle.local; platform: news-aggregator)"
    BASE_URL = "https://www.reddit.com"

    def __init__(
        self,
        user_agent: str = DEFAULT_USER_AGENT,
        cache_ttl: int = 60,
        timeout: int = 15,
    ):
        self.user_agent = user_agent
        self.cache_ttl = cache_ttl
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": self.user_agent})
        self._cache: Dict[str, Tuple[float, List[RedditPost]]] = {}
        self._last_request_time: float = 0.0

    def _rate_limit_throttle(self, min_interval: float = 2.0) -> None:
        """Enforces a brief pause between network requests to prevent 429 rate-limiting."""
        now = time.time()
        elapsed = now - self._last_request_time
        if elapsed < min_interval:
            time.sleep(min_interval - elapsed)
        self._last_request_time = time.time()

    def parse_feed_xml(self, xml_content: Union[bytes, str], fallback_sub: str = "") -> List[RedditPost]:
        """Parse raw Atom XML feed returned by Reddit into structured RedditPost models."""
        if isinstance(xml_content, str):
            xml_content = xml_content.encode("utf-8")

        root = ET.fromstring(xml_content)
        posts: List[RedditPost] = []

        for entry in root.findall("atom:entry", ATOM_NS):
            # ID (e.g. 't3_1wi32jg')
            id_el = entry.find("atom:id", ATOM_NS)
            raw_id = id_el.text.strip() if id_el is not None and id_el.text else ""

            # Title
            title_el = entry.find("atom:title", ATOM_NS)
            title = " ".join((title_el.text or "").split()) if title_el is not None else ""

            # Permalink
            link_el = entry.find("atom:link", ATOM_NS)
            permalink = link_el.attrib.get("href", "") if link_el is not None else ""

            # Author
            author_el = entry.find("atom:author/atom:name", ATOM_NS)
            author = author_el.text.strip() if author_el is not None and author_el.text else "/u/unknown"

            # Subreddit category
            cat_el = entry.find("atom:category", ATOM_NS)
            subreddit = fallback_sub
            if cat_el is not None:
                term = cat_el.attrib.get("term") or cat_el.attrib.get("label", "")
                if term:
                    subreddit = f"r/{term}" if not term.startswith("r/") else term

            # Updated / Published timestamp
            updated_el = entry.find("atom:updated", ATOM_NS)
            published_at = updated_el.text.strip() if updated_el is not None and updated_el.text else None

            # Content HTML & Text
            content_el = entry.find("atom:content", ATOM_NS)
            content_html = content_el.text if content_el is not None and content_el.text else ""

            cleaner = _RedditHTMLCleaner()
            if content_html:
                try:
                    cleaner.feed(content_html)
                except Exception:
                    pass

            clean_text = cleaner.get_clean_text()
            external_url = cleaner.external_url

            # If no external link found in HTML, check if permalink itself is the post
            if not external_url:
                external_url = permalink

            posts.append(
                RedditPost(
                    id=raw_id,
                    title=title,
                    author=author,
                    subreddit=subreddit,
                    permalink=permalink,
                    external_url=external_url,
                    content_text=clean_text,
                    content_html=content_html if content_html else None,
                    published_at=published_at,
                )
            )

        return posts

    def _fetch_url(self, url: str) -> str:
        """Fetches URL with in-memory TTL caching and retry logic."""
        now = time.time()
        # Check cache
        if url in self._cache:
            cached_time, cached_posts = self._cache[url]
            if now - cached_time < self.cache_ttl:
                return cached_posts  # type: ignore

        # Rate-limiting throttle
        self._rate_limit_throttle()

        response = self.session.get(url, timeout=self.timeout)

        # Retry once on 429 if rate limited
        if response.status_code == 429:
            retry_after = 5
            try:
                retry_after = int(response.headers.get("x-ratelimit-reset", 5))
            except Exception:
                pass
            time.sleep(min(retry_after, 10))
            response = self.session.get(url, timeout=self.timeout)

        if not response.ok:
            raise RuntimeError(
                f"Failed to crawl Reddit feed from '{url}' (HTTP {response.status_code}): {response.text[:200]}"
            )

        return response.text

    def get_posts(
        self,
        subreddit: str,
        listing: str = "hot",
        limit: int = 10,
        time_filter: Optional[str] = None,
    ) -> List[RedditPost]:
        """
        Get posts from a subreddit using public Atom/RSS streams.

        :param subreddit: Subreddit name (e.g. 'LocalLLaMA', 'MachineLearning', or 'r/LocalLLaMA').
        :param listing: 'hot', 'new', 'top', or 'rising'.
        :param limit: Maximum number of posts to return (up to 25 per feed).
        :param time_filter: Optional for 'top': 'day', 'week', 'month', 'year', 'all'.
        """
        clean_sub = subreddit.replace("r/", "").strip()
        params = {}
        if listing == "top" and time_filter:
            params["t"] = time_filter

        query_str = f"?{urllib.parse.urlencode(params)}" if params else ""
        url = f"{self.BASE_URL}/r/{clean_sub}/{listing}/.rss{query_str}"

        # Check in-memory cache
        now = time.time()
        if url in self._cache:
            cached_time, cached_posts = self._cache[url]
            if now - cached_time < self.cache_ttl:
                return cached_posts[:limit]

        xml_text = self._fetch_url(url)
        posts = self.parse_feed_xml(xml_text, fallback_sub=f"r/{clean_sub}")
        self._cache[url] = (now, posts)
        return posts[:limit]

    def get_hot(self, subreddit: str, limit: int = 10) -> List[RedditPost]:
        """Convenience method to get hot posts from a subreddit."""
        return self.get_posts(subreddit=subreddit, listing="hot", limit=limit)

    def get_new(self, subreddit: str, limit: int = 10) -> List[RedditPost]:
        """Convenience method to get new posts from a subreddit."""
        return self.get_posts(subreddit=subreddit, listing="new", limit=limit)

    def get_top(self, subreddit: str, time_filter: str = "day", limit: int = 10) -> List[RedditPost]:
        """Convenience method to get top posts from a subreddit within a time window."""
        return self.get_posts(subreddit=subreddit, listing="top", time_filter=time_filter, limit=limit)

    def search(self, query: str, subreddit: Optional[str] = None, limit: int = 10) -> List[RedditPost]:
        """
        Search Reddit submissions across Reddit or within a specific subreddit.
        """
        params = {"q": query, "sort": "relevance"}
        query_str = urllib.parse.urlencode(params)

        if subreddit:
            clean_sub = subreddit.replace("r/", "").strip()
            url = f"{self.BASE_URL}/r/{clean_sub}/search.rss?{query_str}"
            fallback_sub = f"r/{clean_sub}"
        else:
            url = f"{self.BASE_URL}/search.rss?{query_str}"
            fallback_sub = "r/all"

        now = time.time()
        if url in self._cache:
            cached_time, cached_posts = self._cache[url]
            if now - cached_time < self.cache_ttl:
                return cached_posts[:limit]

        xml_text = self._fetch_url(url)
        posts = self.parse_feed_xml(xml_text, fallback_sub=fallback_sub)
        self._cache[url] = (now, posts)
        return posts[:limit]

    def create_digest(
        self,
        subreddits: Union[List[str], str] = ("LocalLLaMA", "MachineLearning"),
        listing: str = "hot",
        limit_per_sub: int = 5,
    ) -> RedditDigest:
        """
        Fetch trending posts across multiple subreddits and package them into an LLM-ready RedditDigest.
        """
        if isinstance(subreddits, str):
            sub_list = [subreddits]
        else:
            sub_list = list(subreddits)

        all_posts: List[RedditPost] = []
        normalized_subs: List[str] = []

        for sub in sub_list:
            clean_sub = sub.replace("r/", "").strip()
            normalized_subs.append(f"r/{clean_sub}")
            try:
                posts = self.get_posts(subreddit=clean_sub, listing=listing, limit=limit_per_sub)
                all_posts.extend(posts)
            except Exception:
                # Tolerate individual subreddit failure to keep digest resilient
                pass

        return RedditDigest(subreddits=normalized_subs, posts=all_posts)


default_crawler = RedditCrawler()


def get_hot_posts(subreddit: str = "LocalLLaMA", limit: int = 10) -> List[RedditPost]:
    """Fetch hot posts from a subreddit using the default unofficial crawler."""
    return default_crawler.get_hot(subreddit=subreddit, limit=limit)


def create_reddit_digest(
    subreddits: Union[List[str], str] = ("LocalLLaMA", "MachineLearning"),
    listing: str = "hot",
    limit_per_sub: int = 5,
) -> RedditDigest:
    """Convenience helper to compile an LLM-ready RedditDigest across multiple subreddits."""
    return default_crawler.create_digest(
        subreddits=subreddits,
        listing=listing,
        limit_per_sub=limit_per_sub,
    )
