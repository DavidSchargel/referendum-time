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
