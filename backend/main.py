"""Main entrypoint for Daily Bugle backend."""

import json
from arxiv import ArxivPaper, fetch_newsletter_digest
from llm_router import LLMRouter


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
    print("Compact LLM Context Payload:")
    print(json.dumps(sample_paper.to_llm_context(), indent=2))

    # 2. Demonstrate llm_router module (OpenRouter)
    print("\n=== 2. LLM Router (OpenRouter) Demo ===")
    router = LLMRouter()
    print(f"Sending test completion to model: {router.default_model}...")

    response = router.chat([
        {"role": "user", "content": "Hello! What can you help me with today?"}
    ])

    # Dict subscripting matching the OpenRouter response schema
    print("\nResponse Content:")
    print(response["choices"][0]["message"]["content"])
    print("\nModel used:", response["model"])
    print("Total tokens:", response["usage"]["total_tokens"])


if __name__ == "__main__":
    main()
