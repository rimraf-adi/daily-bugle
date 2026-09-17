# `reddit` Module Specification (Unofficial Scraper & Subreddit Watcher)

Zero-authentication Reddit crawler, watchlist tracker, and discussion monitor designed for AI agents, research trend surveillance, and community sentiment extraction **without requiring official Reddit API keys or OAuth credentials**.

---

## 1. How Agents Are Supposed to Identify It

Autonomous agents, LLM planners, and multi-source pipelines should identify this module via the following capability contract:

### Capability Signature
- **Namespace:** `reddit` (inside `backend`)
- **Primary Role:** Unofficial Reddit submission scraping, curated subreddit watchlist tracking, post deduplication, and developer sentiment extraction.
- **Authentication:** **None (Zero-Auth)**. Operates via public Atom/RSS streams without API keys or accounts.
- **Rate-Limit Mitigation:** Built-in in-memory TTL cache (default 60s), polite request intervals, and automatic retry on 429 reset windows.
- **Deduplication:** Automatic history tracking of seen post IDs so periodic newsletter runs only receive **new, unseen discussions**.
- **Data Extracted:** Post title, author (`/u/...`), subreddit, discussion permalink, submitted external article URL (e.g. GitHub repos, papers, news), clean selftext, and timestamps.

### Agent Intent Routing Matrix

| User Goal / Agent Intent | Recommended Call | Return Type | Best For |
| :--- | :--- | :--- | :--- |
| **"Track watchlist for new posts"** | `track_subreddits(mark_as_seen=True)` | `RedditDigest` | Periodic polling for new, unseen posts across all watched subreddits. |
| **"Get trending posts across watchlist"** | `get_tracked_digest()` | `RedditDigest` | Generating immediate snapshot newsletters across monitored subreddits. |
| **"Configure a tracked subreddit"** | `tracker.add_subreddit(name, category, ...)` | `TrackedSubreddit` | Adding new communities with keyword/flair filters. |
| **"Track trending developer posts"** | `get_hot_posts("LocalLLaMA", limit=10)` | `List[RedditPost]` | Ad-hoc tracking of hot discussions in a single subreddit. |
| **"Create custom multi-community digest"** | `create_reddit_digest(subreddits=["LocalLLaMA", "MachineLearning"])` | `RedditDigest` | Aggregating specific subreddits into an LLM-ready digest. |
| **"Get top posts of the day/week"** | `crawler.get_top("technology", time_filter="day")` | `List[RedditPost]` | Periodic daily/weekly newsletter roundups. |
| **"Search Reddit for a topic"** | `crawler.search("deepseek", subreddit="LocalLLaMA")` | `List[RedditPost]` | Ad-hoc research across recent submissions. |
| **"Format Reddit pulse for LLM"** | `digest.to_llm_prompt()` | `str` (Markdown) | Synthesizing community reactions into newsletter sections. |
| **"Extract external article link"** | `post.external_url` or `post.full_article_url` | `str` (URL) | Direct link to the external article/repo discussed. |

---

## 2. Module File Structure

```
backend/reddit/
├── __init__.py          # Public API facade
├── crawler.py           # Unofficial RedditCrawler with RSS stream parsing & TTL caching
├── models.py            # RedditPost, TrackedSubreddit, and RedditDigest models
├── tracker.py           # SubredditTracker for watchlist management, deduplication & filtering
└── README.md            # Agent specification and developer documentation (this file)
```

---

## 3. Data Models

### `TrackedSubreddit`
- `name`: Subreddit name (e.g. `"LocalLLaMA"` or `"r/LocalLLaMA"`).
- `category`: Classification (e.g. `"Open Source AI"`, `"Research"`).
- `listing`: Stream type (`"hot"`, `"new"`, `"top"`, `"rising"`).
- `time_filter`: Time period for `"top"` (`"day"`, `"week"`, `"month"`).
- `limit`: Number of posts to collect per cycle.
- `include_keywords`: Only include posts containing these terms.
- `exclude_keywords`: Filter out posts containing these terms (e.g. `["meme", "humor"]`).
- `enabled`: Toggle monitoring state.

### `RedditPost`
- `id`: Unique Reddit post ID (e.g. `"t3_1wi32jg"`).
- `title`: Post title.
- `author`: Reddit author handle (e.g. `"/u/developer"`).
- `subreddit`: Subreddit identifier (e.g. `"r/LocalLLaMA"`).
- `permalink`: Direct URL to Reddit discussion and comments.
- `external_url`: The submitted link (e.g. GitHub repo, news article, arXiv paper) or permalink if selftext.
- `content_text`: Cleaned selftext or post excerpt.
- `published_at`: ISO 8601 timestamp.

---

## 4. Usage Examples

### Example 1: Polling Watchlist for New Unseen Posts (Deduplication)
```python
from reddit import SubredditTracker

# Default tracker comes with curated AI/tech watchlist:
# r/LocalLLaMA, r/MachineLearning, r/artificial, r/singularity, r/technology
tracker = SubredditTracker()

# Automatically pulls only posts that haven't been seen in previous runs
new_digest = tracker.poll_new_posts(mark_as_seen=True)

print(f"Discovered {new_digest.total_posts} new discussions:")
for p in new_digest.posts:
    print(f"[{p.subreddit}] {p.title}")
    print(f"Discussion: {p.permalink}")
    print(f"Source: {p.external_url}")
```

### Example 2: Managing the Watchlist & Adding Filters
```python
from reddit import SubredditTracker

tracker = SubredditTracker(state_file="reddit_state.json")

# Add a targeted subreddit with keyword filters
tracker.add_subreddit(
    name="r/MachineLearning",
    category="Research Breakthroughs",
    listing="top",
    time_filter="day",
    limit=5,
    include_keywords=["paper", "benchmark", "dataset"],
    exclude_keywords=["career", "homework"],
)

# List all active communities being tracked
for sub in tracker.list_watchlist():
    print(f"- {sub.display_name} ({sub.category}) [{sub.listing}]")
```

### Example 3: Full Multi-Source Daily Bugle Briefing (arXiv + Substack + Reddit -> OpenRouter)
```python
from arxiv import fetch_newsletter_digest
from gmail import fetch_substack_newsletters
from reddit import get_tracked_digest
from llm_router import LLMRouter

# 1. Academic research
arxiv_digest = fetch_newsletter_digest(categories=["cs.AI", "cs.LG"], max_results=3)

# 2. Industry newsletters from Gmail
substack_digest = fetch_substack_newsletters(limit=3)

# 3. Community buzz across tracked subreddits
reddit_digest = get_tracked_digest()

# 4. Synthesize unified Daily Bugle edition
unified_prompt = f"""
Draft the Daily Bugle Executive Briefing:

1. ACADEMIC BREAKTHROUGHS (arXiv):
{arxiv_digest.to_markdown()}

2. INDUSTRY PERSPECTIVES (Substack):
{substack_digest.to_markdown()}

3. COMMUNITY DISCUSSIONS (Tracked Subreddits):
{reddit_digest.to_markdown()}
"""

router = LLMRouter()
edition = router.complete(prompt=unified_prompt)
print(edition.content)
```
