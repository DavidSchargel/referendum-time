# Referendum Time (local)

## Executive Summary

**referendum-time** is a time-aware Oregon ballot-initiative tracking tool built live in just over two hours as a workflow demonstration at *Let's Build with A.I.* (Thu, Mar 05 2026) at the Metro Region Innovation Hub in Portland, Oregon. The project showcased an advanced workflow, demonstrating what an individual can ship in a single afternoon session using modern AI-assisted development tools. The idea of evaluating [Oregon House Bill 4123](https://gov.oregonlive.com/bill/2026/HB4123/) (Limits the circumstances under which a landlord may disclose confidential information) was seeded by an wonderful non-coder attendee from Salem, Oregon who is working on her own startup idea on for businesses educating their administartive staff on how to use AI effectively.

The application idea was to answer one core question: **"How can we lookup a Oregon ballot initiative?"** and provide pros & cons with minimal bias.

> ⚠️ **Not fully working.** The bones are there, but it’s not fully polished or complete. The Brave Search integration is rate-limited and may require multiple tries to get results. The OpenAI analysis is basic and could be improved with better prompts and formatting. The UI is functional but not styled. The focus was on demonstrating the workflow, not on delivering a production-ready product.

> ⚠️ **This is not production-quality code.** It was built to demonstrate workflow.

## Table of Contents for Documentation

[Table of Contents](https://github.com/DavidSchargel/referendum-time/blob/main/docs/table-of-contents.md)

## Generic Summary

Next.js (NEVER AGAIN) - site that:

- Searches **official Oregon sources** with **Brave Search API**
- Generates an **informational** plain-language summary + **Pro voice vs Con voice** discussion via **OpenAI (gpt-4o-mini)**
- Shows **titles + short snippets + links** (no full-text display)
- Sets **noindex/nofollow** headers/meta (no SEO)

## Setup

1) Install deps

```bash
npm install
```

1) Create `.env.local`

```bash
cp .env.example .env.local
```

Fill in:

- `BRAVE_SEARCH_API_KEY`
- `OPENAI_API_KEY`

> Do not commit `.env.local`.

1) Run locally

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
