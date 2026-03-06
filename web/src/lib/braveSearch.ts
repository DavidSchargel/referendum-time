// Environment configuration with defaults
const MIN_START_INTERVAL_MS = Math.max(0, parseInt(process.env.BRAVE_SEARCH_MIN_START_INTERVAL_MS ?? '1200', 10));
const MAX_ATTEMPTS = Math.max(1, parseInt(process.env.BRAVE_SEARCH_MAX_ATTEMPTS ?? '3', 10));
const RETRY_BASE_DELAY_MS = Math.max(0, parseInt(process.env.BRAVE_SEARCH_RETRY_BASE_DELAY_MS ?? '1200', 10));
const RETRY_MAX_DELAY_MS = Math.max(0, parseInt(process.env.BRAVE_SEARCH_RETRY_MAX_DELAY_MS ?? '8000', 10));

// Module-scope limiter state (shared across all calls in same process)
let lastStartMs = 0;
let limiterQueue: (() => void)[] = [];
let limiterBusy = false;

// Helper: sleep for ms
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Helper: parse Retry-After header (returns delay in ms, or null if unparseable)
function parseRetryAfter(header: string | null): number | null {
  if (!header) return null;

  // Try parsing as integer seconds
  const asSeconds = parseInt(header, 10);
  if (!isNaN(asSeconds) && asSeconds > 0) {
    return asSeconds * 1000;
  }

  // Try parsing as HTTP date (e.g., "Wed, 21 Oct 2015 07:28:00 GMT")
  const asDate = new Date(header);
  if (!isNaN(asDate.getTime())) {
    const delayMs = asDate.getTime() - Date.now();
    return delayMs > 0 ? delayMs : null;
  }

  return null;
}

// Helper: run a task through the serialized limiter
async function runThroughBraveLimiter<T>(task: () => Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const enqueued = async () => {
      try {
        const result = await task();
        resolve(result);
      } catch (err) {
        reject(err);
      } finally {
        limiterBusy = false;
        processLimiterQueue();
      }
    };

    limiterQueue.push(enqueued);
    processLimiterQueue();
  });
}

// Process next queued task (if any)
function processLimiterQueue(): void {
  if (limiterBusy || limiterQueue.length === 0) {
    return;
  }

  limiterBusy = true;
  const nextTask = limiterQueue.shift()!;

  // Enforce minimum interval between request *starts*
  const now = Date.now();
  const elapsed = now - lastStartMs;
  const waitMs = Math.max(0, MIN_START_INTERVAL_MS - elapsed);

  if (waitMs > 0) {
    setTimeout(() => {
      lastStartMs = Date.now();
      nextTask();
    }, waitMs);
  } else {
    lastStartMs = now;
    nextTask();
  }
}

// Internal: fetch Brave with retry loop (already inside limiter)
async function fetchBraveWithRetries(url: string, headers: Record<string, string>): Promise<BraveWebResult[]> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const res = await fetch(url, { headers });

    if (res.ok) {
      const json = (await res.json()) as BraveWebSearchResponse;
      const rawResults = json.web?.results ?? [];

      const results: BraveWebResult[] = [];
      for (const r of rawResults) {
        if (!r.url) continue;
        results.push({
          title: r.title ?? r.url,
          url: r.url,
          description: r.description,
        });
      }
      return results;
    }

    // If 429 and we have retries remaining, wait and retry
    if (res.status === 429 && attempt < MAX_ATTEMPTS) {
      const retryAfterHeader = res.headers.get('Retry-After');
      const parsedDelay = parseRetryAfter(retryAfterHeader);

      let delayMs: number;
      if (parsedDelay !== null) {
        delayMs = parsedDelay;
      } else {
        // Exponential backoff: base * 2^(attempt-1), capped at max
        delayMs = Math.min(RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1), RETRY_MAX_DELAY_MS);
      }

      await sleep(delayMs);
      continue;
    }

    // Non-retryable error or retries exhausted
    const body = await res.text().catch(() => '');
    throw new Error(`Brave Search error: ${res.status} ${res.statusText}${body ? ` – ${body}` : ''}`);
  }

  // Should never reach here, but TypeScript needs it
  throw new Error('Brave Search error: unexpected retry loop completion');
}

export type BraveWebResult = {
  title: string;
  url: string;
  description?: string;
};

type BraveWebSearchResponse = {
  web?: {
    results?: Array<{
      title?: string;
      url?: string;
      description?: string;
    }>;
  };
};

export const __internal = {
  parseRetryAfter,
  resetLimiterState() {
    lastStartMs = 0;
    limiterQueue = [];
    limiterBusy = false;
  },
};

export async function braveWebSearch(opts: {
  query: string;
  count?: number;
  country?: string;
  searchLang?: string;
  freshness?: 'day' | 'week' | 'month' | 'year' | 'all';
  apiKey: string;
}): Promise<BraveWebResult[]> {
  const { query, apiKey } = opts;

  const url = new URL('https://api.search.brave.com/res/v1/web/search');
  url.searchParams.set('q', query);
  url.searchParams.set('count', String(opts.count ?? 5));
  url.searchParams.set('country', opts.country ?? 'US');
  url.searchParams.set('search_lang', opts.searchLang ?? 'en');
  if (opts.freshness && opts.freshness !== 'all') url.searchParams.set('freshness', opts.freshness);

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-Subscription-Token': apiKey,
  };

  // All Brave attempts go through the limiter
  return runThroughBraveLimiter(() => fetchBraveWithRetries(url.toString(), headers));
}
