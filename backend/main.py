"""Main entrypoint for Daily Bugle backend."""

import json
from arxiv import (
    ArxivClient,
    ArxivPaper,
    NewsletterDigest,
    fetch_newsletter_digest,
    search_papers,
)


def main():
    print("Daily Bugle Backend initialized!")
    print("\n--- Example: Semantic Output Structure for Newsletter Manager ---")

    # Example: Create a sample paper to demonstrate semantic LLM output
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

    print("\n1. Compact LLM Context Payload (token-efficient):")
    print(json.dumps(sample_paper.to_llm_context(), indent=2))

    print("\n2. Markdown representation with Full Article link:")
    print(sample_paper.to_markdown())

    digest = NewsletterDigest(
        topic="Daily Bugle AI Morning Brief",
        papers=[sample_paper],
    )

    print("\n3. Generated LLM Prompt for Newsletter Digest:")
    print(digest.to_llm_prompt())


if __name__ == "__main__":
    main()
