## Goal
Eliminate **Brave Search 429 RATE_LIMITED** errors by ensuring the app never exceeds the Brave Free plan request rate (observed as `rate_limit: 1`) while keeping the current “official sources only” workflow.

## Current state (grounded in repo)
- Brave calls are centralized in `web/src/lib/braveSearch.ts` (`braveWebSearch()`), which **immediately fetches** and **throws on any non-OK** response.
- `web/src/pages/api/analyze.ts` currently issues **4 Brave searches in parallel** via `Promise.all(domains.map(...))` (one per official domain), which can exceed Brave’s per-second rate limit.
- The UI (`web/src/pages/bill/[billId].tsx`) POSTs to `/api/analyze` and displays **plain-text error bodies** from the server; this error contract should remain unchanged.
- Repo intentionally has **no DB** and **no server-side caching** (`web/README.md`, `Cache-Control: no-store` in `analyze.ts`).

## Locked decisions / defaults (no further decisions needed)
1. **Keep the 4-domain “official sources only” strategy** in `analyze.ts`.
2. Add server-side pacing primarily inside `braveWebSearch()` so *all* Brave calls are throttled in one place.
3. Throttle policy (defaults):
   - **Max in-flight Brave requests per Node process:** `1`
   - **Minimum time between Brave request starts:** `1200ms` (safely > 1 second)
4. Add bounded retry/backoff for **HTTP 429**:
   - Max attempts: `3` total attempts (first try + up to 2 retries)
   - Honor `Retry-After` header if present; otherwise exponential backoff
5. Update `/api/analyze` to **not fail the entire request** when one domain’s search fails:
   - Collect results per-domain sequentially (clear + explicit)
   - Proceed if at least one domain succeeds and at least one source remains after dedupe
   - If all domains fail → return a clear plain-text error with a non-200 status
6. **No caching/persistence** in this iteration.
7. **No client error contract changes** (still plain-text bodies on error).

## Implementation plan (ordered, file-by-file)

### 1) Add an in-process rate limiter + 429 retry to `web/src/lib/braveSearch.ts`
**File:** `web/src/lib/braveSearch.ts`

**What to add (internal-only helpers; keep exported API the same):**
- `sleep(ms: number): Promise<void>`
- Env-config reader with defaults (see “Environment knobs” below)
- A **module-scope serialized queue/mutex** to ensure only one Brave request attempt runs at a time
- Tracking for `lastStartMs` to enforce minimum interval between *starts*
- `Retry-After` parsing:
  - If header is an integer: treat as seconds
  - If header is an HTTP date: compute delay until that time
  - If parsing fails: ignore and use fallback backoff

**Limiter behavior (exact invariant to implement):**
For every Brave request *attempt* (including retries):
- Wait your turn in a **single-concurrency queue**
- Ensure: `start(attempt_n+1) >= start(attempt_n) + MIN_START_INTERVAL_MS`
- Run the actual `fetch(...)`
- Important: the queue must **remain usable even if an attempt throws** (i.e., errors must not “break” the chain; ensure the next queued task still runs)

**Retry behavior (exact rules):**
- Attempt loop: `attempt = 1..BRAVE_SEARCH_MAX_ATTEMPTS`
- For each attempt, run the fetch **through the limiter**
- If `res.ok`: parse JSON, normalize results, return
- If `res.status === 429` and `attempt < maxAttempts`:
  - Determine delay:
    1) `Retry-After` (if present and valid), else
    2) fallback delay = `min(BASE_DELAY_MS * 2^(attempt-1), MAX_DELAY_MS)`
  - `await sleep(delay)` then continue
- If non-OK and not retryable (or attempts exhausted):
  - Read body text (as currently done) and throw `Error("Brave Search error: ...")` (keep today’s error-string style)

**Non-goals in this file:**
- No response shape changes (still returns `BraveWebResult[]`)
- No caching layer

---

### 2) Make `/api/analyze` domain searches sequential + tolerant of per-domain failure
**File:** `web/src/pages/api/analyze.ts`

**Replace current behavior:**
- Current: `Promise.all(domains.map(async (domain) => braveWebSearch(...)))` which is parallel + fail-fast.

**New behavior (exact flow):**
1. Keep `domains` array exactly as-is.
2. Create:
   - `const collected: SourceItem[] = []`
   - `let successfulDomains = 0`
3. For each `domain` in `domains` (in order):
   - Build query exactly as today: `` `${billId} site:${domain}` ``
   - `try`:
     - call `braveWebSearch(...)` (now throttled + retried)
     - map results to `SourceItem` (same mapping as today)
     - push into `collected`
     - increment `successfulDomains`
   - `catch`:
     - continue to next domain (optional: `console.warn` for visibility)
4. After loop:
   - If `successfulDomains === 0`:
     - Return non-200 (choose `502 Bad Gateway`) with plain text:
       - `Unable to retrieve official sources from Brave Search for any configured domain after retries. Please try again in a few seconds.`
   - Compute `sources = uniqByUrl(collected).slice(0, 12)` (same dedupe/cap behavior)
   - If `sources.length === 0`:
     - Return non-200 (choose `404 Not Found` or `502`; lock decision here as **404**) with plain text:
       - `No official-source search results were found for ${billId}.`
5. If sources exist: continue OpenAI prompt/LLM flow unchanged.

**What must remain unchanged:**
- Request validation / billId normalization / OpenAI call / Zod parsing
- Plain-text error bodies for non-200 responses (client expects `res.text()`)

---

### 3) Documentation update
**File:** `web/README.md`

Add a short note under “Notes”:
- Brave Search requests are **rate-limited in-process** to avoid 429s (calls are serialized + spaced)
- Analyses may take a few extra seconds because searches are intentionally paced
- Document environment knobs (names + defaults)
- Re-affirm: still no DB and no server-side caching

(Do **not** add `.env.example` in this task; the repo currently does not contain `web/.env.example`, despite README mentioning it. That’s a separate fix.)

---

## Environment knobs (exact names + defaults)
Implement these in `web/src/lib/braveSearch.ts` as optional env overrides:

- `BRAVE_SEARCH_MIN_START_INTERVAL_MS` (default: `1200`)
- `BRAVE_SEARCH_MAX_ATTEMPTS` (default: `3`)
- `BRAVE_SEARCH_RETRY_BASE_DELAY_MS` (default: `1200`)
- `BRAVE_SEARCH_RETRY_MAX_DELAY_MS` (default: `8000`)

Clamping rules (decision locked):
- Any missing/invalid value falls back to default
- Minimums:
  - interval/base/max delay: clamp to `0+`
  - max attempts: clamp to at least `1`

Concurrency is locked to **1 in-flight request per process** (do not make it env-tunable in this iteration).

## Manual test plan (no new test framework required)

### A) Happy path (default throttling)
1. Set `BRAVE_SEARCH_API_KEY` and `OPENAI_API_KEY`
2. `npm run dev` in `web/`
3. Go to `/bill/HB4123` (or any valid example) and click “Generate analysis”
4. Expected:
   - No “Brave Search error: 429 … RATE_LIMITED”
   - Slightly longer wait (Brave calls are serialized)

### B) Concurrency/queue behavior (multiple rapid requests)
1. Open two browser tabs for two different bills (or same bill)
2. Click “Generate analysis” in both within a second
3. Expected:
   - Requests queue (one may take longer)
   - No 429 errors in UI

### C) Retry path sanity check
1. Temporarily set `BRAVE_SEARCH_MIN_START_INTERVAL_MS=0` and keep `BRAVE_SEARCH_MAX_ATTEMPTS=3`
2. Trigger analysis
3. Expected:
   - If Brave returns 429, the server waits and retries up to the attempt limit
   - Either succeeds after delay or eventually fails with the new plain-text upstream error

### D) Partial domain failure tolerance
1. Force intermittent Brave failure (e.g., temporarily set an invalid key, then restore; or test during unstable network)
2. Expected:
   - One domain failure does not automatically kill the whole request
   - If at least one domain succeeds and yields sources, analysis still completes

## Assumptions (explicit)
- This project is primarily used as described in `web/README.md` (“local”); an **in-process limiter** is acceptable.
- Brave Free plan rate limiting is the primary cause of 429s.
- Increased latency (a few seconds) is acceptable to avoid rate-limit failures.

## Known limitations (explicit)
- The limiter is **per Node process** only. If deployed to multiple server instances/serverless isolates, aggregate traffic can still exceed Brave’s rate limit. Addressing that would require shared coordination (Redis/KV/queue) or caching—out of scope for this task.
- If multiple users trigger many analyses concurrently, later requests may take long enough to hit hosting timeouts (depending on deployment). The local setup should be fine.
