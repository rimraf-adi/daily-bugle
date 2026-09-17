import unittest
from arxiv import ArxivClient, ArxivPaper

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
    <link href="http://arxiv.org/abs/2609.00001v1" rel="alternate" type="text/html"/>
    <link title="pdf" href="http://arxiv.org/pdf/2609.00001v1" rel="related" type="application/pdf"/>
  </entry>
</feed>
"""

class TestArxivModule(unittest.TestCase):
    def test_parse_feed(self):
        client = ArxivClient()
        papers = client.parse_feed(SAMPLE_ARXIV_XML)
        
        self.assertEqual(len(papers), 1)
        paper = papers[0]
        self.assertIsInstance(paper, ArxivPaper)
        self.assertEqual(paper.arxiv_id, "2609.00001v1")
        self.assertEqual(paper.title, "Sample AI Breakthrough Paper")
        self.assertEqual(paper.summary, "This is a test summary for the sample AI paper.")
        self.assertEqual(paper.authors, ["Alice Smith", "Bob Jones"])
        self.assertEqual(paper.primary_category, "cs.AI")
        self.assertIn("cs.LG", paper.categories)
        self.assertEqual(paper.pdf_url, "http://arxiv.org/pdf/2609.00001v1")
        self.assertEqual(paper.entry_url, "http://arxiv.org/abs/2609.00001v1")

if __name__ == "__main__":
    unittest.main()
