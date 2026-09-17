import json
import ssl
import time
from pathlib import Path
import requests
import streamlit as st

try:
    ssl._create_default_https_context = ssl._create_unverified_context
except AttributeError:
    pass

# Import Daily Bugle modules
from arxiv import (
    CATEGORY_MAP,
    SUBJECT_TAXONOMY,
    ArxivClient,
    get_category_name,
    search_categories,
    get_categories_by_subject,
    normalize_arxiv_query,
)
from llm_router import LLMRouter, ChatResponse
from gmail import GmailClient, SubstackEmail
from reddit import (
    COMMON_SUBREDDIT_ALIASES,
    RedditCrawler,
    RedditPost,
    SubredditTracker,
    TrackedSubreddit,
    normalize_subreddit,
)


def render_dashboard() -> None:
    """Main rendering loop for the Daily Bugle Streamlit dashboard."""
    # Page Configuration
    st.set_page_config(
        page_title="Daily Bugle - Raw Module Dashboard",
        page_icon="📰",
        layout="wide",
        initial_sidebar_state="expanded",
    )

    st.title("📰 Daily Bugle - Raw Module Control Dashboard")
    st.caption("Interactive control room & raw output visualizer for all ingestion and routing modules (Non-LLM sanitized)")

    # Sidebar Navigation
    st.sidebar.title("Navigation")
    active_module = st.sidebar.radio(
        "Select Module to Inspect:",
        [
            "1. arXiv Research Ingestion",
            "2. Reddit Unofficial Watcher",
            "3. Gmail Substack Tracker",
            "4. OpenRouter LLM Router",
            "5. Multi-Source Raw Feed",
        ],
        key="global_nav_module",
    )

    st.sidebar.markdown("---")
    st.sidebar.markdown("**Module Status:**")
    st.sidebar.success("✅ `arxiv`: Ready (166 Categories)")
    st.sidebar.success("✅ `reddit`: Ready (Zero-Auth RSS)")
    st.sidebar.success("✅ `gmail`: Ready (IMAP SSL)")
    st.sidebar.success("✅ `llm_router`: Ready (OpenRouter)")

    # ==============================================================================
    # TAB 1: arXiv RESEARCH INGESTION
    # ==============================================================================
    if active_module == "1. arXiv Research Ingestion":
        st.header("🔬 arXiv Research Ingestion (Raw API)")
        st.markdown("Direct queries against the official arXiv API (`http://export.arxiv.org/api/query`). Displays un-sanitized Atom XML and parsed payload.")

        col1, col2, col3 = st.columns([2, 1, 1])
        with col1:
            query_type = st.radio("Query Mode", ["Category Code", "Free-text Search"], horizontal=True, key="arxiv_query_mode")
            if query_type == "Category Code":
                subject_list = list(SUBJECT_TAXONOMY.keys())
                default_subj_idx = subject_list.index("Computer Science") if "Computer Science" in subject_list else 0
                subject = st.selectbox("Subject Area", subject_list, index=default_subj_idx, key="arxiv_subject_select")
                sub_cats = SUBJECT_TAXONOMY.get(subject, {})
                cat_options = [f"{code} - {name}" for code, name in sub_cats.items()]
                selected_display = st.selectbox(
                    "Category",
                    cat_options,
                    key=f"arxiv_cat_select_{subject}",
                )
                selected_cat = selected_display.split(" - ")[0] if selected_display else "cs.AI"
                search_query = f"cat:{selected_cat}"
            else:
                search_query = st.text_input("Custom Search Query", value="diffusion models AND robotics", key="arxiv_custom_query")

        with col2:
            max_results = st.number_input("Max Results", min_value=1, max_value=25, value=5, key="arxiv_max_results")
            sort_by = st.selectbox("Sort By", ["submittedDate", "lastUpdatedDate", "relevance"], key="arxiv_sort_by")

        with col3:
            sort_order = st.selectbox("Sort Order", ["descending", "ascending"], key="arxiv_sort_order")
            fetch_btn = st.button("🚀 Fetch Raw arXiv Data", use_container_width=True, type="primary", key="arxiv_fetch_btn")

        if fetch_btn:
            with st.spinner("Fetching raw Atom feed from arXiv API..."):
                t0 = time.time()
                client = ArxivClient(timeout=20)
                normalized_query = normalize_arxiv_query(search_query)
                params = {
                    "search_query": normalized_query,
                    "start": 0,
                    "max_results": max_results,
                    "sortBy": sort_by,
                    "sortOrder": sort_order,
                }
                headers = {"User-Agent": "DailyBugleDashboard/1.0"}
                try:
                    resp = requests.get(client.BASE_URL, params=params, headers=headers, timeout=20)
                    resp.raise_for_status()
                    raw_xml_text = resp.text
                    parsed_papers = client.parse_feed(resp.content)
                    latency = time.time() - t0
                    st.session_state["arxiv_cached_data"] = {
                        "papers": parsed_papers,
                        "raw_xml": raw_xml_text,
                        "url": resp.url,
                        "latency": latency,
                        "query": normalized_query,
                    }
                except Exception as e:
                    st.error(f"arXiv API request failed: {e}")

        cache = st.session_state.get("arxiv_cached_data")
        if cache:
            papers = cache["papers"]
            st.info(f"Retrieved **{len(papers)} papers** for `{cache.get('query', '')}` in `{cache['latency']:.2f}s` | Query URL: `{cache['url']}`")

            view_tab1, view_tab2, view_tab3 = st.tabs(["Structured Raw Cards", "Raw JSON Payload", "Raw Atom XML"])

            with view_tab1:
                for idx, p in enumerate(papers, 1):
                    with st.expander(f"#{idx} [{p.arxiv_id}] {p.title}", expanded=(idx == 1)):
                        col_a, col_b = st.columns([3, 1])
                        with col_a:
                            st.markdown(f"**Authors:** {', '.join(p.authors) if p.authors else 'Unknown'}")
                            st.markdown(f"**Primary Topic:** `{p.primary_category}` ({p.primary_category_name})")
                            st.markdown(f"**All Categories:** {', '.join(p.categories)}")
                            st.markdown(f"**Published:** `{p.published}` | **Updated:** `{p.updated}`")
                            if p.comment:
                                st.markdown(f"**Author Comment / Code:** `{p.comment}`")
                            if p.doi:
                                st.markdown(f"**DOI:** `{p.doi}`")
                            st.markdown(f"**Raw Abstract:**\n\n{p.abstract}")
                        with col_b:
                            st.markdown("#### Direct Links")
                            if p.links:
                                st.markdown(f"🌐 [Web HTML Article]({p.links.html})")
                                st.markdown(f"📄 [Direct PDF]({p.links.pdf})")
                                st.markdown(f"🔗 [Abstract Page]({p.links.abstract})")

            with view_tab2:
                st.markdown("#### Complete JSON Payload (`p.to_dict()`)")
                st.json([p.to_dict() for p in papers])

            with view_tab3:
                st.markdown("#### Raw XML Feed Stream")
                st.code(cache["raw_xml"], language="xml")

    # ==============================================================================
    # TAB 2: REDDIT UNOFFICIAL WATCHER
    # ==============================================================================
    elif active_module == "2. Reddit Unofficial Watcher":
        st.header("🤖 Unofficial Reddit Watcher (Zero-Auth)")
        st.markdown("Scrapes public Atom/RSS streams without Reddit API keys or credentials. Features in-memory TTL caching and deduplication.")

        reddit_mode = st.radio("Mode", ["Ad-Hoc Subreddit Explorer", "Subreddit Watchlist Tracker"], horizontal=True, key="reddit_mode_select")

        if reddit_mode == "Ad-Hoc Subreddit Explorer":
            col1, col2, col3 = st.columns([2, 1, 1])
            with col1:
                POPULAR_AI_SUBS = [
                    "r/artificial (General AI Community)",
                    "r/LocalLLaMA (Open-Source & Local LLMs)",
                    "r/MachineLearning (Academic ML Research)",
                    "r/singularity (AGI & Frontier Tech)",
                    "r/ArtificialInteligence (AI Discussions)",
                    "r/ChatGPT (OpenAI & Chatbot Discussions)",
                    "r/ClaudeAI (Anthropic Claude Discussions)",
                    "Custom Subreddit...",
                ]
                sub_preset = st.selectbox("Select Subreddit", POPULAR_AI_SUBS, index=0, key="reddit_sub_preset")
                if sub_preset == "Custom Subreddit...":
                    raw_sub = st.text_input("Subreddit Name", value="artificial", key="reddit_sub_input")
                else:
                    raw_sub = sub_preset.split(" ")[0].replace("r/", "")
                
                clean_sub = normalize_subreddit(raw_sub)
                if clean_sub.lower() != raw_sub.lower().replace("r/", ""):
                    st.caption(f"💡 Normalized alias: `r/{raw_sub}` ➔ `r/{clean_sub}`")

            with col2:
                listing = st.selectbox("Listing Stream", ["hot", "new", "top", "rising"], key="reddit_listing_select")
                time_filter = st.selectbox("Time Filter (for top)", ["day", "week", "month", "year", "all"], key="reddit_time_filter")
            with col3:
                r_limit = st.number_input("Limit", min_value=1, max_value=25, value=5, key="reddit_limit_input")
                r_fetch = st.button("📡 Fetch Raw Reddit Feed", type="primary", use_container_width=True, key="reddit_fetch_btn")

            if r_fetch:
                with st.spinner(f"Crawling r/{clean_sub} ({listing})..."):
                    t0 = time.time()
                    crawler = RedditCrawler()
                    params = {}
                    if listing == "top":
                        params["t"] = time_filter
                    query_str = f"?{urllib.parse.urlencode(params)}" if params else ""
                    url = f"{crawler.BASE_URL}/r/{clean_sub}/{listing}/.rss{query_str}"
                    
                    try:
                        posts = crawler.get_posts(clean_sub, listing=listing, limit=r_limit, time_filter=time_filter if listing == "top" else None)
                        latency = time.time() - t0
                        xml_content = crawler._fetch_url(url)
                        st.session_state["reddit_cached_data"] = {
                            "posts": posts,
                            "raw_xml": xml_content,
                            "url": url,
                            "latency": latency,
                            "sub": clean_sub,
                        }
                    except Exception as e:
                        err_msg = str(e)
                        if "404" in err_msg:
                            st.error(f"❌ Subreddit 'r/{clean_sub}' was not found on Reddit (HTTP 404). Note: the main AI subreddits are `r/artificial`, `r/ArtificialInteligence`, or `r/MachineLearning`.")
                        elif "429" in err_msg:
                            st.warning("⚠️ Reddit rate limit reached (HTTP 429). Please wait a few seconds before crawling again.")
                        else:
                            st.error(f"Reddit crawl failed: {e}")

            r_cache = st.session_state.get("reddit_cached_data")
            if r_cache:
                posts = r_cache["posts"]
                st.info(f"Retrieved **{len(posts)} posts** from `r/{r_cache.get('sub', clean_sub)}` in `{r_cache['latency']:.2f}s` | Endpoint: `{r_cache['url']}`")

                r_tab1, r_tab2, r_tab3 = st.tabs(["Structured Raw Posts", "Raw JSON Dumps", "Raw Atom Stream"])

                with r_tab1:
                    for idx, post in enumerate(posts, 1):
                        with st.expander(f"#{idx} [{post.subreddit}] {post.title}", expanded=(idx == 1)):
                            st.markdown(f"**Author:** `{post.author}` | **Published:** `{post.published_at}`")
                            st.markdown(f"💬 [Reddit Discussion Permalink]({post.permalink})")
                            if post.external_url and post.external_url != post.permalink:
                                st.markdown(f"🔗 **Submitted External Article/Repo:** [{post.external_url}]({post.external_url})")
                            if post.content_text:
                                st.markdown(f"**Body Text:**\n\n{post.content_text}")

                with r_tab2:
                    st.json([p.to_dict() for p in posts])

                with r_tab3:
                    st.code(r_cache["raw_xml"], language="xml")

        else:
            st.subheader("📋 Subreddit Watchlist Manager & Deduplication")
            tracker = SubredditTracker()

            col_wl1, col_wl2 = st.columns([2, 1])
            with col_wl1:
                st.markdown("#### Currently Tracked Subreddits")
                watchlist = tracker.list_watchlist(enabled_only=False)
                for sub in watchlist:
                    status_icon = "🟢" if sub.enabled else "⚪"
                    st.markdown(f"{status_icon} **{sub.display_name}** — `{sub.category}` | stream: `{sub.listing}` (limit: {sub.limit})")
                    if sub.include_keywords:
                        st.caption(f"Include keywords: {', '.join(sub.include_keywords)}")
                    if sub.exclude_keywords:
                        st.caption(f"Exclude keywords: {', '.join(sub.exclude_keywords)}")

            with col_wl2:
                st.markdown("#### Add New Subreddit to Watchlist")
                new_sub_name = st.text_input("Subreddit", placeholder="e.g. singularity", key="reddit_wl_new_name")
                new_sub_cat = st.text_input("Category", placeholder="e.g. AGI & Frontier Tech", key="reddit_wl_new_cat")
                new_sub_stream = st.selectbox("Stream", ["hot", "new", "top"], key="reddit_wl_new_stream")
                if st.button("➕ Add to Watchlist", key="reddit_wl_add_btn"):
                    if new_sub_name:
                        tracker.add_subreddit(name=new_sub_name, category=new_sub_cat or "General", listing=new_sub_stream)
                        st.success(f"Added {new_sub_name} to watchlist!")
                        st.rerun()

            st.markdown("---")
            col_poll1, col_poll2 = st.columns([1, 1])
            with col_poll1:
                poll_btn = st.button("🔄 Poll New Unseen Posts (Deduplication Test)", type="primary", use_container_width=True, key="reddit_poll_btn")
            with col_poll2:
                if st.button("🧹 Reset Seen History", use_container_width=True, key="reddit_reset_btn"):
                    tracker.reset_seen()
                    st.success("Seen history cleared!")

            if poll_btn:
                with st.spinner("Polling tracked subreddits for unseen posts..."):
                    digest = tracker.poll_new_posts(mark_as_seen=True)
                    st.success(f"Discovered **{digest.total_posts} new, unseen posts** across {len(digest.subreddits)} subreddits!")
                    for p in digest.posts:
                        st.markdown(f"- **[{p.subreddit}]** [{p.title}]({p.permalink}) (by `{p.author}`)")
                        if p.external_url and p.external_url != p.permalink:
                            st.caption(f"  External Link: {p.external_url}")

    # ==============================================================================
    # TAB 3: GMAIL SUBSTACK TRACKER
    # ==============================================================================
    elif active_module == "3. Gmail Substack Tracker":
        st.header("📬 Gmail Substack Newsletter Ingestion")
        st.markdown("Connects securely via IMAP over SSL to inspect and parse Substack newsletter issues and extract direct web links.")

        col1, col2, col3 = st.columns([2, 1, 1])
        with col1:
            folder = st.text_input("Mailbox Folder", value="INBOX", key="gmail_folder_input")
            custom_query = st.text_input("Custom Search Query (optional)", placeholder='e.g. FROM "substack.com"', key="gmail_custom_query")
        with col2:
            g_limit = st.number_input("Limit Emails", min_value=1, max_value=20, value=5, key="gmail_limit_input")
            unread_only = st.checkbox("Unread Only (UNSEEN)", value=False, key="gmail_unread_only")
        with col3:
            g_fetch = st.button("📨 Fetch Gmail Newsletters", type="primary", use_container_width=True, key="gmail_fetch_btn")

        if g_fetch:
            with st.spinner("Connecting to Gmail IMAP server and retrieving messages..."):
                t0 = time.time()
                try:
                    client = GmailClient()
                    client.connect()
                    emails = client.fetch_substack_emails(
                        folder=folder,
                        limit=g_limit,
                        unread_only=unread_only,
                        custom_query=custom_query if custom_query else None,
                    )
                    latency = time.time() - t0
                    st.session_state["gmail_cached_data"] = {
                        "emails": emails,
                        "latency": latency,
                        "user": client.user,
                    }
                    client.disconnect()
                except Exception as e:
                    st.error(f"Gmail connection failed: {e}")

        g_cache = st.session_state.get("gmail_cached_data")
        if g_cache:
            emails = g_cache["emails"]
            st.info(f"Connected as `{g_cache['user']}` | Retrieved **{len(emails)} Substack issues** in `{g_cache['latency']:.2f}s`")

            if not emails:
                st.warning("No Substack newsletter issues found in this mailbox matching the criteria.")
            else:
                gm_tab1, gm_tab2 = st.tabs(["Parsed Substack Cards", "Raw JSON Dump"])
                with gm_tab1:
                    for idx, em in enumerate(emails, 1):
                        with st.expander(f"#{idx} [{em.sender_name}] {em.subject}", expanded=(idx == 1)):
                            st.markdown(f"**From:** `{em.sender}`")
                            st.markdown(f"**Date:** `{em.date}`")
                            if em.web_url:
                                st.markdown(f"🌐 **Direct Substack Web Post:** [{em.web_url}]({em.web_url})")
                            st.markdown("**Body Excerpt:**")
                            st.text_area(f"text_body_{idx}", value=em.body_text, height=180, disabled=True)
                            if em.links:
                                st.markdown(f"**Extracted Links ({len(em.links)}):**")
                                for lk in em.links[:5]:
                                    st.caption(f"- {lk}")
                with gm_tab2:
                    st.json([e.to_dict() for e in emails])

    # ==============================================================================
    # TAB 4: OPENROUTER LLM ROUTER
    # ==============================================================================
    elif active_module == "4. OpenRouter LLM Router":
        st.header("⚡ OpenRouter LLM Router (Raw Response Inspector)")
        st.markdown("Direct interactive playground for querying OpenRouter models. Visualizes the exact raw JSON response schema, token counts, and selected model.")

        col1, col2 = st.columns([1, 2])
        with col1:
            model_choice = st.selectbox(
                "Model Selection",
                [
                    "openrouter/free",
                    "meta-llama/llama-3.3-70b-instruct:free",
                    "google/gemini-2.0-flash-exp:free",
                    "liquid/lfm-2.5-2.6b:free",
                    "Custom Model ID",
                ],
                key="llm_model_choice",
            )
            if model_choice == "Custom Model ID":
                model_name = st.text_input("Custom Model ID", value="anthropic/claude-3.5-sonnet", key="llm_custom_model_id")
            else:
                model_name = model_choice

            system_prompt = st.text_area(
                "System Prompt (optional)",
                value="You are a precise technical analyst for the Daily Bugle research briefing.",
                height=100,
                key="llm_system_prompt",
            )
            temperature = st.slider("Temperature", min_value=0.0, max_value=1.0, value=0.7, step=0.05, key="llm_temperature")

        with col2:
            user_prompt = st.text_area(
                "User Message",
                value="Synthesize the primary distinctions between parameter-efficient fine-tuning (PEFT) and full fine-tuning.",
                height=150,
                key="llm_user_prompt",
            )
            send_btn = st.button("🚀 Send to OpenRouter", type="primary", use_container_width=True, key="llm_send_btn")

        if send_btn:
            with st.spinner(f"Sending request to {model_name} via OpenRouter..."):
                t0 = time.time()
                try:
                    router = LLMRouter(default_model=model_name)
                    messages = []
                    if system_prompt.strip():
                        messages.append({"role": "system", "content": system_prompt})
                    messages.append({"role": "user", "content": user_prompt})

                    resp = router.chat(messages=messages, model=model_name, temperature=temperature)
                    latency = time.time() - t0

                    st.success(f"Response received in `{latency:.2f}s` | Model used: `{resp.model}`")

                    # Key metrics
                    m1, m2, m3, m4 = st.columns(4)
                    m1.metric("Selected Model", resp.model.split("/")[-1])
                    m2.metric("Prompt Tokens", resp.usage.prompt_tokens)
                    m3.metric("Completion Tokens", resp.usage.completion_tokens)
                    m4.metric("Total Tokens", resp.usage.total_tokens)

                    llm_tab1, llm_tab2 = st.tabs(["Raw Completion Text", "Exact OpenRouter JSON Schema"])
                    with llm_tab1:
                        st.text_area("Raw Text Response", value=resp.content, height=300)

                    with llm_tab2:
                        st.markdown("#### Exact Response Schema (`resp.raw` / `resp.to_dict()`)")
                        st.json(resp.raw or resp.to_dict())

                except Exception as e:
                    st.error(f"OpenRouter call failed: {e}")

    # ==============================================================================
    # TAB 5: MULTI-SOURCE RAW FEED
    # ==============================================================================
    elif active_module == "5. Multi-Source Raw Feed":
        st.header("🌐 Multi-Source Raw Ingestion Feed")
        st.markdown("Inspect raw ingestion across all three external channels (arXiv, Reddit, Gmail) simultaneously.")

        if st.button("⚡ Fetch Multi-Source Snapshot", type="primary", key="multi_snapshot_btn"):
            col_ar, col_rd, col_gm = st.columns(3)

            with col_ar:
                st.subheader("🔬 arXiv (cs.AI)")
                with st.spinner("Fetching arXiv..."):
                    try:
                        ar_client = ArxivClient()
                        ar_papers = ar_client.fetch_recent_papers("cs.AI", max_results=3)
                        st.success(f"Retrieved {len(ar_papers)} papers")
                        for p in ar_papers:
                            st.markdown(f"**[{p.arxiv_id}]** [{p.title[:60]}...]({p.full_article_url})")
                            st.caption(f"Authors: {', '.join(p.authors[:2])}")
                    except Exception as e:
                        st.error(f"arXiv error: {e}")

            with col_rd:
                st.subheader("🤖 Reddit (r/LocalLLaMA)")
                with st.spinner("Fetching Reddit..."):
                    try:
                        rd_crawler = RedditCrawler()
                        rd_posts = rd_crawler.get_hot("LocalLLaMA", limit=3)
                        st.success(f"Retrieved {len(rd_posts)} posts")
                        for p in rd_posts:
                            st.markdown(f"**[{p.title[:60]}...]({p.permalink})**")
                            st.caption(f"Author: {p.author}")
                    except Exception as e:
                        st.error(f"Reddit error: {e}")

            with col_gm:
                st.subheader("📬 Substack (Gmail)")
                with st.spinner("Fetching Gmail..."):
                    try:
                        gm_client = GmailClient()
                        gm_client.connect()
                        gm_emails = gm_client.fetch_substack_emails(limit=3)
                        gm_client.disconnect()
                        st.success(f"Retrieved {len(gm_emails)} issues")
                        for em in gm_emails:
                            st.markdown(f"**[{em.subject[:50]}...]({em.web_url or '#'})**")
                            st.caption(f"From: {em.sender_name}")
                    except Exception as e:
                        st.error(f"Gmail status: {e}")


if __name__ == "__main__":
    render_dashboard()
