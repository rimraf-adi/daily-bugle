"""Main entrypoint for Daily Bugle backend."""

import json
from arxiv import ArxivPaper
from reddit import RedditPost, SubredditTracker


def main():
    print("Daily Bugle Backend initialized!\n")

    # 1. Demonstrate arxiv module
    print("=== 1. arXiv Module Demo ===")
    sample_paper = ArxivPaper(
        arxiv_id="2403.12345v1",
        title="Attention Is All You Need 2.0: Scalable Next-Gen Transformers",
        abstract="We introduce a novel architecture reducing quadratic complexity to linear while improving retrieval accuracy.",
        authors=["Alice Smith", "Bob Jones"],
        published="2026-09-17T00:00:00Z",
        primary_category="cs.AI",
        primary_category_name="Artificial Intelligence",
        categories=["cs.AI", "cs.LG"],
        category_names=["Artificial Intelligence", "Machine Learning"],
    )
    print("Direct Full Article Link:", sample_paper.full_article_url)
    print("Semantic Markdown:")
    print(sample_paper.to_markdown()[:250], "...\n")

    # 2. Demonstrate reddit unofficial tracker module
    print("=== 2. Reddit Watchlist Tracker Demo (Zero-Auth) ===")
    tracker = SubredditTracker()
    print(f"Monitoring {len(tracker.list_watchlist())} curated subreddits:")
    for sub in tracker.list_watchlist():
        print(f"  - {sub.display_name} ({sub.category}) [{sub.listing}]")

    sample_post = RedditPost(
        id="t3_demo123",
        title="Meta releases Llama 4 technical report with full native multimodal reasoning",
        author="/u/ml_enthusiast",
        subreddit="r/LocalLLaMA",
        permalink="https://www.reddit.com/r/LocalLLaMA/comments/demo123/llama_4_technical_report/",
        external_url="https://ai.meta.com/research/publications/llama-4",
        content_text="Detailed evaluation benchmarks showing breakthrough code and reasoning capabilities.",
        published_at="2026-09-17T08:00:00Z",
    )
    print("\nSample Tracked Reddit Discussion:")
    print(f"Title: {sample_post.title}")
    print(f"Discussion: {sample_post.permalink}")
    print(f"External Source: {sample_post.external_url}")


if __name__ == "__main__":
    main()
