# 🗞️ The Daily Bugle

> **All the AI Intelligence & Raw Research Payloads Fit to Compute**

The Daily Bugle is a modern, full-stack intelligence platform built with **Next.js 16 (App Router)**, **React 19**, and **TypeScript**. It shifts automated intelligence gathering away from fragmented scripts into a high-performance newsroom terminal and editorial front page.

---

## ⚡ Highlights & Key Capabilities

- **📰 Editorial Digital Newspaper Landing Page (`/`)**: Classic masthead with live breaking tickers, investigative dispatches, and responsive multi-column layouts.
- **🎛️ Interactive Command Center Dashboard (`/dashboard`)**: Unified control room with live state management across all 4 intelligence feeds.
- **🔬 arXiv Research Wire Terminal**:
  - Full taxonomy covering **166 subcategories** across Computer Science, Statistics, Mathematics, and Physics.
  - Automatic bare discipline wildcard expansion (`cat:stat` ➔ `cat:stat.*`).
  - Direct links to abstracts, PDFs, and HTML full-text articles.
  - **Raw API Output Inspection**: Live Atom XML feed & parsed JSON schema viewers.
- **📡 Zero-Auth Reddit Community Watcher**:
  - Public Atom/RSS feed crawler—**no Reddit developer credentials required**.
  - Rate limiting politeness throttling (2.5s) and in-memory TTL caching (60s).
  - Subreddit alias and typo normalizer (e.g. `r/artificialintelligence` ➔ `r/artificial`).
  - Built-in Watchlist Manager with seen-post deduplication and keyword filtering.
  - **Raw API Output Inspection**: Full XML feed & raw JSON payload viewer.
- **📬 Substack Newsletter IMAP Tracker**:
  - Secure TLS IMAP client (`imapflow`) connecting to `imap.gmail.com:993`.
  - Canonical Substack post web URL detector (`https://*.substack.com/p/*`).
  - **Raw API Output Inspection**: Raw RFC822 message headers and message source.
- **🧠 OpenRouter LLM Studio**:
  - Unified completion router supporting free models (`openrouter/free`, `google/gemini-2.0-flash-exp:free`, `meta-llama/llama-3.3-70b-instruct:free`, `mistralai/mistral-7b-instruct:free`, etc.) and premium frontier models.
  - Prompt/completion token usage metric counters.
  - **Raw API Output Inspection**: Un-altered raw response schema viewer (`rawJson`).
- **⚡ Parallel Multi-Source Snapshot**: One-click concurrent trigger across all feeds.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Webpack builder, React 19)
- **Language**: TypeScript 5 (Strict mode)
- **Styling**: Tailwind CSS v4 + Newspaper Editorial Typography
- **XML Engine**: `fast-xml-parser`
- **IMAP Engine**: `imapflow`
- **Icons**: `lucide-react`

---

## 🚀 Quick Start

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/rimraf-adi/daily-bugle.git
cd daily-bugle

# Install dependencies
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Configure your API keys in `.env.local`:

```ini
# OpenRouter API Key (required for LLM Studio & newsletter generation)
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Gmail IMAP Credentials (optional, for Substack tracking)
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_16_char_google_app_password
```

### 3. Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) for the digital newspaper or [http://localhost:3000/dashboard](http://localhost:3000/dashboard) for the command center.

### 4. Production Build

```bash
npm run build
npm start
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/arxiv` | Search arXiv papers (`category`, `q`, `sortBy`, `limit`) |
| `GET` | `/api/reddit` | Unofficial Reddit feed (`sub`, `listing`, `timeFilter`, `limit`) |
| `GET` | `/api/reddit/watchlist` | List or poll tracked subreddits with deduplication |
| `POST` | `/api/reddit/watchlist` | Add, remove, or toggle tracked subreddits |
| `GET` | `/api/gmail` | Fetch recent Substack newsletter emails via IMAP |
| `POST` | `/api/llm` | Execute chat completion via OpenRouter with token metrics |
| `GET` | `/api/snapshot` | Execute concurrent multi-source intelligence snapshot |

---

## 📜 License

MIT License. Designed and published for automated intelligence journalism.
