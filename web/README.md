# Referendum Time (local)

Next.js (Pages Router) site that:

- Searches **official Oregon sources** with **Brave Search API**
- Generates an **informational** plain-language summary + **Pro voice vs Con voice** discussion via **OpenAI (gpt-4o-mini)**
- Shows **titles + short snippets + links** (no full-text display)
- Sets **noindex/nofollow** headers/meta (no SEO)

## Setup

1) Install deps

```bash
npm install
```

2) Create `.env.local`

```bash
cp .env.example .env.local
```

Fill in:

- `BRAVE_SEARCH_API_KEY`
- `OPENAI_API_KEY`

> Do not commit `.env.local`.

3) Run locally

```bash
npm run dev
```

Open http://localhost:3000

## Notes

- No database is used.
- No caching is performed server-side (the UI provides a manual “Generate/Refresh analysis” button).
- Accessibility: semantic landmarks + keyboard navigation + strong focus visibility + high-contrast defaults.
- Brave Search requests are **rate-limited in-process** to avoid 429 errors. Calls are serialized and spaced to stay within the Free plan rate limit.
- Analyses may take a few extra seconds because Brave searches are intentionally paced.

## Environment Variables

### Required
- `BRAVE_SEARCH_API_KEY` — Your Brave Search API key.
- `OPENAI_API_KEY` — Your OpenAI API key.

### Optional (Brave Search rate limiting)
- `BRAVE_SEARCH_MIN_START_INTERVAL_MS` — Minimum time between Brave request starts (default: `1200`)
- `BRAVE_SEARCH_MAX_ATTEMPTS` — Maximum retry attempts per request (default: `3`)
- `BRAVE_SEARCH_RETRY_BASE_DELAY_MS` — Base delay for 429 retries (default: `1200`)
- `BRAVE_SEARCH_RETRY_MAX_DELAY_MS` — Maximum delay for 429 retries (default: `8000`)

## Tests

Run unit tests:

```bash
npm test
```

Coverage:

```bash
npm run test:coverage
```

> Unit tests mock Brave/OpenAI calls; no API keys are required to run tests.
