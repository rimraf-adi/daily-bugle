import json
import unittest
from arxiv import (
    ArxivClient,
    ArxivPaper,
    NewsletterDigest,
    PaperLinks,
    CATEGORY_MAP,
)

SAMPLE_ARXIV_XML = """<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:arxiv="http://arxiv.org/schemas/atom">
  <title type="html">arXiv Query: cat:cs.AI</title>
  <id>http://arxiv.org/api/12345</id>
  <updated>2026-09-17T00:00:00Z</updated>
  <entry>
    <id>http://arxiv.org/abs/2609.00001v1</id>
    <updated>2026-09-16T12:00:00Z</updated>
    <published>2026-09-16T12:00:00Z</published>
    <title>Sample AI Breakthrough Paper</title>
    <summary>This is a test summary for the sample AI paper.</summary>
    <author>
      <name>Alice Smith</name>
    </author>
    <author>
      <name>Bob Jones</name>
    </author>
    <arxiv:primary_category term="cs.AI" scheme="http://arxiv.org/schemas/atom"/>
    <category term="cs.AI" scheme="http://arxiv.org/schemas/atom"/>
    <category term="cs.LG" scheme="http://arxiv.org/schemas/atom"/>
    <arxiv:comment>Accepted at NeurIPS 2026; code at github.com/test/repo</arxiv:comment>
    <arxiv:doi>10.1000/182</arxiv:doi>
    <link href="http://arxiv.org/abs/2609.00001v1" rel="alternate" type="text/html"/>
    <link title="pdf" href="http://arxiv.org/pdf/2609.00001v1" rel="related" type="application/pdf"/>
  </entry>
</feed>
"""


class TestArxivModule(unittest.TestCase):
    def setUp(self):
        self.client = ArxivClient()
        self.papers = self.client.parse_feed(SAMPLE_ARXIV_XML)
        self.paper = self.papers[0]

    def test_parse_feed_semantic_fields(self):
        self.assertEqual(len(self.papers), 1)
        self.assertIsInstance(self.paper, ArxivPaper)
        self.assertEqual(self.paper.arxiv_id, "2609.00001v1")
        self.assertEqual(self.paper.title, "Sample AI Breakthrough Paper")
        self.assertEqual(self.paper.abstract, "This is a test summary for the sample AI paper.")
        self.assertEqual(self.paper.summary, self.paper.abstract)  # alias check
        self.assertEqual(self.paper.authors, ["Alice Smith", "Bob Jones"])
        self.assertEqual(self.paper.primary_category, "cs.AI")
        self.assertEqual(self.paper.primary_category_name, "Artificial Intelligence")
        self.assertIn("Machine Learning", self.paper.category_names)
        self.assertEqual(self.paper.comment, "Accepted at NeurIPS 2026; code at github.com/test/repo")
        self.assertEqual(self.paper.doi, "10.1000/182")

    def test_full_article_links(self):
        self.assertIsNotNone(self.paper.links)
        self.assertEqual(self.paper.links.abstract, "http://arxiv.org/abs/2609.00001v1")
        self.assertEqual(self.paper.links.pdf, "http://arxiv.org/pdf/2609.00001v1")
        self.assertEqual(self.paper.links.html, "https://arxiv.org/html/2609.00001v1")
        self.assertEqual(self.paper.full_article_url, "https://arxiv.org/html/2609.00001v1")

    def test_json_serialization(self):
        json_str = self.paper.to_json()
        data = json.loads(json_str)
        self.assertEqual(data["arxiv_id"], "2609.00001v1")
        self.assertEqual(data["links"]["full_article"], "https://arxiv.org/html/2609.00001v1")

    def test_llm_context(self):
        context = self.paper.to_llm_context()
        self.assertIn("full_article_link", context)
        self.assertIn("https://arxiv.org/html/2609.00001v1", context["full_article_link"])
        self.assertEqual(context["primary_topic"], "Artificial Intelligence")

    def test_newsletter_digest(self):
        digest = NewsletterDigest(
            topic="Weekly AI Insights",
            papers=self.papers,
        )
        self.assertEqual(digest.total_papers, 1)

        # Verify LLM prompt generation
        prompt = digest.to_llm_prompt()
        self.assertIn("Weekly AI Insights", prompt)
        self.assertIn("Sample AI Breakthrough Paper", prompt)
        self.assertIn("https://arxiv.org/html/2609.00001v1", prompt)
        self.assertIn("Full Article Links:", prompt)

        # Verify JSON export
        digest_json = digest.to_json()
        digest_dict = json.loads(digest_json)
        self.assertEqual(digest_dict["total_papers"], 1)


if __name__ == "__main__":
    unittest.main()
