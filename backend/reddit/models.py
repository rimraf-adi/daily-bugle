from __future__ import annotations

import json
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


@dataclass
class RedditPost:
    """Represents a Reddit submission scraped via public feeds without API keys."""
    id: str
    title: str
    author: str
    subreddit: str
    permalink: str
    external_url: Optional[str] = None
    content_text: str = ""
    content_html: Optional[str] = None
    published_at: Optional[str] = None
    flair: Optional[str] = None

    @property
    def full_article_url(self) -> str:
        """Best available link for the full post (external article if link post, else permalink)."""
        return self.external_url or self.permalink

    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        if "content_html" in data:
            data.pop("content_html")
        return data

    def to_json(self, indent: int = 2) -> str:
        return json.dumps(self.to_dict(), indent=indent)

    def to_llm_context(self, max_body_chars: int = 1000) -> Dict[str, Any]:
        """Token-optimized dictionary specifically for prompt injection."""
        excerpt = self.content_text
        if len(excerpt) > max_body_chars:
            excerpt = excerpt[:max_body_chars].rstrip() + "... [truncated]"

        return {
            "id": self.id,
            "title": self.title,
            "subreddit": self.subreddit,
            "author": self.author,
            "permalink": self.permalink,
            "external_url": self.external_url,
            "published_at": self.published_at,
            "summary": excerpt,
        }

    def to_markdown(self) -> str:
        """Format post as semantic markdown with clickable discussion and full article links."""
        link_md = f"[{self.title}]({self.permalink})"
        lines = [
            f"### {link_md}",
            f"- **Subreddit:** `{self.subreddit}` | **Author:** `{self.author}`",
            f"- **Published:** {self.published_at or 'N/A'}",
            f"- **Discussion:** [Reddit Comments]({self.permalink})",
        ]
        if self.external_url and self.external_url != self.permalink:
            lines.append(f"- **Linked Source:** [External Article]({self.external_url})")

        if self.content_text:
            lines.append(f"\n{self.content_text[:800]}\n")
        return "\n".join(lines)


@dataclass
class TrackedSubreddit:
    """Configuration for a specific subreddit being monitored."""
    name: str  # e.g. "LocalLLaMA" or "r/LocalLLaMA"
    category: str = "General"  # e.g. "AI & Machine Learning", "Tech News"
    listing: str = "hot"  # 'hot', 'top', 'new', 'rising'
    time_filter: Optional[str] = "day"  # 'day', 'week', 'month' (for 'top')
    limit: int = 5
    include_keywords: List[str] = field(default_factory=list)
    exclude_keywords: List[str] = field(default_factory=list)
    enabled: bool = True

    @property
    def clean_name(self) -> str:
        return self.name.replace("r/", "").strip()

    @property
    def display_name(self) -> str:
        clean = self.clean_name
        return f"r/{clean}"

    def matches(self, post: RedditPost) -> bool:
        """Evaluates whether a post satisfies keyword filtering rules."""
        text = f"{post.title} {post.content_text}".lower()

        # Exclude filter
        for kw in self.exclude_keywords:
            if kw.lower() in text:
                return False

        # Include filter (if empty, matches all)
        if self.include_keywords:
            return any(kw.lower() in text for kw in self.include_keywords)

        return True

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> TrackedSubreddit:
        return cls(**data)


@dataclass
class RedditDigest:
    """Collection of trending Reddit posts compiled for AI agent consumption and newsletter generation."""
    subreddits: List[str] = field(default_factory=list)
    posts: List[RedditPost] = field(default_factory=list)
    generated_at: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )

    @property
    def total_posts(self) -> int:
        return len(self.posts)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "subreddits": self.subreddits,
            "total_posts": self.total_posts,
            "generated_at": self.generated_at,
            "posts": [p.to_dict() for p in self.posts],
        }

    def to_json(self, indent: int = 2) -> str:
        return json.dumps(self.to_dict(), indent=indent)

    def to_llm_payload(self) -> List[Dict[str, Any]]:
        return [p.to_llm_context() for p in self.posts]

    def to_llm_prompt(self, custom_instructions: Optional[str] = None) -> str:
        """
        Generates a complete prompt formatted for OpenRouter / LLMs to synthesize
        trending community discussions into a newsletter section.
        """
        posts_context = "\n---\n\n".join(p.to_markdown() for p in self.posts)
        subreddits_str = ", ".join(self.subreddits) if self.subreddits else "Tech & AI Subreddits"
        instructions = custom_instructions or (
            "1. Synthesize these Reddit discussions into a 'Community Buzz & Trending Discussions' section for Daily Bugle.\n"
            "2. Highlight emerging developer sentiment, open-source discoveries, and grassroots debates.\n"
            "3. For each highlight, MUST include direct clickable markdown links to the Reddit discussion and any linked external articles.\n"
            "4. Keep the summary punchy, analytical, and objective."
        )

        return f"""You are the technology community editor for the Daily Bugle Newsletter.
Review the following {self.total_posts} trending posts from {subreddits_str} collected on {self.generated_at}:

### INSTRUCTIONS:
{instructions}

### TRENDING REDDIT POSTS:
{posts_context}
"""

    def to_markdown(self) -> str:
        subreddits_str = ", ".join(self.subreddits) if self.subreddits else "Reddit"
        lines = [
            f"# Daily Bugle Community Pulse: {subreddits_str}",
            f"*Generated: {self.generated_at} | Posts analyzed: {self.total_posts}*",
            "\n---\n",
        ]
        for p in self.posts:
            lines.append(p.to_markdown())
            lines.append("\n---\n")
        return "\n".join(lines)
