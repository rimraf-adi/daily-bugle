import unittest
from unittest.mock import MagicMock, patch

from reddit import (
    RedditCrawler,
    RedditDigest,
    RedditPost,
    SubredditTracker,
    TrackedSubreddit,
)

SAMPLE_REDDIT_ATOM_XML = """<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <category term="LocalLLaMA" label="r/LocalLLaMA"/>
  <updated>2026-09-17T03:58:50+00:00</updated>
  <entry>
    <id>t3_1wi32jg</id>
    <title>New Open-Weight Breakthrough Model Released</title>
    <link href="https://www.reddit.com/r/LocalLLaMA/comments/1wi32jg/new_open_weight_model/"/>
    <author>
      <name>/u/ai_researcher</name>
      <uri>https://www.reddit.com/user/ai_researcher</uri>
    </author>
    <category term="LocalLLaMA" label="r/LocalLLaMA"/>
    <updated>2026-09-17T03:00:00+00:00</updated>
    <content type="html">
      &lt;table&gt;&lt;tr&gt;&lt;td&gt;&lt;a href="https://github.com/example/awesome-model"&gt;[link]&lt;/a&gt;&lt;/td&gt;&lt;td&gt;&lt;a href="https://www.reddit.com/r/LocalLLaMA/comments/1wi32jg/new_open_weight_model/"&gt;[comments]&lt;/a&gt;&lt;/td&gt;&lt;/tr&gt;&lt;/table&gt;
      &lt;p&gt;Weights have just dropped on HuggingFace with full 4-bit quantization support!&lt;/p&gt;
    </content>
  </entry>
</feed>
"""


class TestRedditModule(unittest.TestCase):
    def setUp(self):
        self.crawler = RedditCrawler(cache_ttl=60)

    def test_parse_feed_xml(self):
        posts = self.crawler.parse_feed_xml(SAMPLE_REDDIT_ATOM_XML)
        self.assertEqual(len(posts), 1)

        post = posts[0]
        self.assertEqual(post.id, "t3_1wi32jg")
        self.assertEqual(post.title, "New Open-Weight Breakthrough Model Released")
        self.assertEqual(post.author, "/u/ai_researcher")
        self.assertEqual(post.subreddit, "r/LocalLLaMA")
        self.assertEqual(post.permalink, "https://www.reddit.com/r/LocalLLaMA/comments/1wi32jg/new_open_weight_model/")
        self.assertEqual(post.external_url, "https://github.com/example/awesome-model")
        self.assertIn("HuggingFace with full 4-bit quantization", post.content_text)

    def test_to_llm_context(self):
        posts = self.crawler.parse_feed_xml(SAMPLE_REDDIT_ATOM_XML)
        context = posts[0].to_llm_context()

        self.assertEqual(context["id"], "t3_1wi32jg")
        self.assertEqual(context["external_url"], "https://github.com/example/awesome-model")
        self.assertIn("HuggingFace", context["summary"])

    def test_reddit_digest(self):
        posts = self.crawler.parse_feed_xml(SAMPLE_REDDIT_ATOM_XML)
        digest = RedditDigest(subreddits=["r/LocalLLaMA"], posts=posts)

        self.assertEqual(digest.total_posts, 1)

        prompt = digest.to_llm_prompt()
        self.assertIn("r/LocalLLaMA", prompt)
        self.assertIn("New Open-Weight Breakthrough Model Released", prompt)
        self.assertIn("https://github.com/example/awesome-model", prompt)

    @patch("reddit.crawler.requests.Session.get")
    def test_caching(self, mock_get):
        mock_response = MagicMock()
        mock_response.ok = True
        mock_response.status_code = 200
        mock_response.text = SAMPLE_REDDIT_ATOM_XML
        mock_get.return_value = mock_response

        # First call fetches via network
        posts1 = self.crawler.get_posts("LocalLLaMA", limit=5)
        self.assertEqual(len(posts1), 1)
        self.assertEqual(mock_get.call_count, 1)

        # Second call within TTL should hit cache without network GET
        posts2 = self.crawler.get_posts("LocalLLaMA", limit=5)
        self.assertEqual(len(posts2), 1)
        self.assertEqual(mock_get.call_count, 1)

    def test_tracked_subreddit_filters(self):
        sub = TrackedSubreddit(
            name="r/LocalLLaMA",
            category="AI",
            include_keywords=["quantization", "gguf"],
            exclude_keywords=["meme"],
        )
        post_match = RedditPost(
            id="1",
            title="4-bit quantization release",
            author="test",
            subreddit="r/LocalLLaMA",
            permalink="https://reddit.com",
            content_text="Supports gguf format",
        )
        self.assertTrue(sub.matches(post_match))

        post_excluded = RedditPost(
            id="2",
            title="A hilarious meme about GPUs",
            author="test",
            subreddit="r/LocalLLaMA",
            permalink="https://reddit.com",
            content_text="quantization meme",
        )
        self.assertFalse(sub.matches(post_excluded))

    @patch("reddit.crawler.requests.Session.get")
    def test_tracker_polling_and_deduplication(self, mock_get):
        mock_response = MagicMock()
        mock_response.ok = True
        mock_response.status_code = 200
        mock_response.text = SAMPLE_REDDIT_ATOM_XML
        mock_get.return_value = mock_response

        tracker = SubredditTracker(crawler=self.crawler)
        # Configure to only track LocalLLaMA for this test
        for s in tracker.list_watchlist():
            if s.clean_name.lower() != "localllama":
                tracker.set_enabled(s.clean_name, False)

        # First poll: finds 1 new post and marks it as seen
        digest1 = tracker.poll_new_posts(mark_as_seen=True)
        self.assertEqual(digest1.total_posts, 1)
        self.assertTrue(tracker.is_seen("t3_1wi32jg"))

        # Second poll: post is already seen, returns 0 new posts
        digest2 = tracker.poll_new_posts(mark_as_seen=True)
        self.assertEqual(digest2.total_posts, 0)


if __name__ == "__main__":
    unittest.main()
