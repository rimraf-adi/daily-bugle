# `gmail` Module Specification

Specialized Gmail IMAP ingestion engine focused on tracking, parsing, and extracting **Substack newsletter issues** for AI agents, periodic briefings, and autonomous research synthesis.

---

## 1. How Agents Are Supposed to Identify It

Autonomous agents and LLM orchestration frameworks should identify this module via the following capability contract:

### Capability Signature
- **Namespace:** `gmail` (inside `backend`)
- **Primary Role:** Email newsletter ingestion, focusing on Substack publications received in Gmail.
- **Protocol:** Secure IMAP over SSL (`imap.gmail.com:993`).
- **Data Extracted:** Publication name, issue title, direct web URL to the Substack post, clean body text, key external links, and timestamps.
- **Environment:** Automatically resolves `GMAIL_USER` and `GMAIL_APP_PASSWORD` from `backend/.env`.

### Agent Intent Routing Matrix

| User Goal / Agent Intent | Recommended Call | Return Type | Best For |
| :--- | :--- | :--- | :--- |
| **"Check recent Substack newsletters"** | `fetch_substack_newsletters(limit=10)` | `SubstackDigest` | Fetching latest issues across subscribed Substack publications. |
| **"Only get unread Substack emails"** | `fetch_substack_newsletters(unread_only=True)` | `SubstackDigest` | Periodic polling or daily cron jobs. |
| **"Format Substack issues for LLM"** | `digest.to_llm_prompt()` | `str` (Markdown Prompt) | Direct prompt injection for drafting executive briefings. |
| **"Get token-efficient payload"** | `digest.to_llm_payload()` | `list[dict]` | Structured tool-calling without HTML bloat. |
| **"Extract direct post link"** | `email.web_url` or `email.full_article_url` | `str` (URL) | Clickable link to read full Substack post on web. |

---

## 2. Module File Structure

```
backend/gmail/
├── __init__.py          # Public API facade
├── client.py            # GmailClient using standard library imaplib & email parser
├── models.py            # SubstackEmail and SubstackDigest semantic models
└── README.md            # Agent specification and developer documentation (this file)
```

---

## 3. Configuration & Security

Configure credentials in `backend/.env`:

```bash
# Gmail user / email address
GMAIL_USER=your_email@gmail.com

# 16-character Google App Password (spaces optional)
GMAIL_APP_PASSWORD=your_app_password_here
```

### Gmail Setup Requirements:
1. **Enable IMAP in Gmail:**
   - Go to **Gmail Settings** -> **See all settings** -> **Forwarding and POP/IMAP**.
   - Select **Enable IMAP** and click **Save Changes**.
2. **Generate a Google App Password:**
   - Visit: `https://myaccount.google.com/apppasswords` (requires 2-Step Verification enabled).
   - Create an app password named "Daily Bugle".
   - Copy the 16-letter password into `backend/.env`.

---

## 4. Usage Examples

### Example 1: Fetching Substack Issues
```python
from gmail import GmailClient

with GmailClient() as client:
    emails = client.fetch_substack_emails(limit=5)

for issue in emails:
    print(f"Publication: {issue.sender_name}")
    print(f"Subject: {issue.subject}")
    print(f"Read Online: {issue.web_url}")
    print(f"Summary: {issue.body_text[:200]}...")
    print("---")
```

### Example 2: Automated LLM Synthesis with `llm_router`
```python
from gmail import fetch_substack_newsletters
from llm_router import LLMRouter

# 1. Fetch latest Substack issues
digest = fetch_substack_newsletters(limit=5)

# 2. Feed directly into OpenRouter to synthesize an executive summary
router = LLMRouter()
summary = router.complete(
    prompt=digest.to_llm_prompt(),
    system_prompt="You are an executive research analyst for Daily Bugle.",
)

print("Generated using:", summary.model)
print(summary.content)
```

### Example 3: Full Multi-Source Daily Bugle (arXiv + Substack -> OpenRouter)
```python
from arxiv import fetch_newsletter_digest
from gmail import fetch_substack_newsletters
from llm_router import LLMRouter

# 1. Ingest academic research
arxiv_digest = fetch_newsletter_digest(categories=["cs.AI", "cs.LG"], max_results=3)

# 2. Ingest industry thought leadership
substack_digest = fetch_substack_newsletters(limit=3)

# 3. Combine into unified briefing prompt
unified_prompt = f"""
Combine the latest research breakthroughs with industry commentary:

### ACADEMIC PAPERS:
{arxiv_digest.to_markdown()}

### SUBSTACK NEWSLETTERS:
{substack_digest.to_markdown()}
"""

router = LLMRouter()
briefing = router.complete(prompt=unified_prompt)
print(briefing.content)
```
