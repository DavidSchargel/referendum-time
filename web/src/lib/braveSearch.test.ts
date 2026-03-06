import { beforeEach, describe, expect, it, vi } from 'vitest';

function makeRes(opts: {
  ok: boolean;
  status: number;
  statusText?: string;
  retryAfter?: string | null;
  json?: any;
  text?: string;
}) {
  return {
    ok: opts.ok,
    status: opts.status,
    statusText: opts.statusText ?? '',
    headers: {
      get: (key: string) => {
        if (key.toLowerCase() !== 'retry-after') return null;
        return opts.retryAfter ?? null;
      },
    },
    json: async () => opts.json,
    text: async () => opts.text ?? '',
  };
}

async function importModule() {
  vi.resetModules();
  return await import('./braveSearch');
}

describe('braveSearch', () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    delete process.env.BRAVE_SEARCH_MIN_START_INTERVAL_MS;
    delete process.env.BRAVE_SEARCH_MAX_ATTEMPTS;
    delete process.env.BRAVE_SEARCH_RETRY_BASE_DELAY_MS;
    delete process.env.BRAVE_SEARCH_RETRY_MAX_DELAY_MS;
  });

  it('parses Retry-After seconds and http-date', async () => {
    const { __internal } = await importModule();

    expect(__internal.parseRetryAfter('2')).toBe(2000);
    expect(__internal.parseRetryAfter('0')).toBeNull();
    expect(__internal.parseRetryAfter(null)).toBeNull();

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2020-01-01T00:00:00.000Z'));
    expect(__internal.parseRetryAfter('Wed, 01 Jan 2020 00:00:02 GMT')).toBe(2000);
  });

  it('retries on 429 using Retry-After header delay', async () => {
    process.env.BRAVE_SEARCH_MAX_ATTEMPTS = '2';

    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    fetchMock
      .mockResolvedValueOnce(makeRes({ ok: false, status: 429, retryAfter: '2' }))
      .mockResolvedValueOnce(
        makeRes({
          ok: true,
          status: 200,
          json: {
            web: {
              results: [{ url: 'https://example.com/a', title: 'A', description: 'D' }],
            },
          },
        })
      );

    const { braveWebSearch, __internal } = await importModule();
    __internal.resetLimiterState();

    vi.useFakeTimers();

    const p = braveWebSearch({ query: 'q', apiKey: 'k' });

    // wait for retry delay
    await vi.advanceTimersByTimeAsync(2000);

    const results = await p;
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(results).toEqual([{ title: 'A', url: 'https://example.com/a', description: 'D' }]);
  });

  it('uses exponential backoff when Retry-After is missing', async () => {
    process.env.BRAVE_SEARCH_MAX_ATTEMPTS = '2';
    process.env.BRAVE_SEARCH_RETRY_BASE_DELAY_MS = '1000';
    process.env.BRAVE_SEARCH_RETRY_MAX_DELAY_MS = '8000';

    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    fetchMock
      .mockResolvedValueOnce(makeRes({ ok: false, status: 429, retryAfter: null }))
      .mockResolvedValueOnce(
        makeRes({
          ok: true,
          status: 200,
          json: { web: { results: [{ url: 'https://example.com/a', title: 'A' }] } },
        })
      );

    const { braveWebSearch, __internal } = await importModule();
    __internal.resetLimiterState();

    vi.useFakeTimers();

    const p = braveWebSearch({ query: 'q', apiKey: 'k' });

    await vi.advanceTimersByTimeAsync(1000);

    const results = await p;
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(results[0].url).toBe('https://example.com/a');
  });

  it('throws after retries are exhausted', async () => {
    process.env.BRAVE_SEARCH_MAX_ATTEMPTS = '2';
    process.env.BRAVE_SEARCH_RETRY_BASE_DELAY_MS = '1000';

    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    fetchMock
      .mockResolvedValueOnce(makeRes({ ok: false, status: 429, retryAfter: null }))
      .mockResolvedValueOnce(makeRes({ ok: false, status: 429, statusText: 'Too Many', retryAfter: null, text: 'nope' }));

    const { braveWebSearch, __internal } = await importModule();
    __internal.resetLimiterState();

    vi.useFakeTimers();

    const p = braveWebSearch({ query: 'q', apiKey: 'k' });
    await vi.advanceTimersByTimeAsync(1000);

    await expect(p).rejects.toThrow(/Brave Search error: 429/i);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('does not retry non-429 errors', async () => {
    process.env.BRAVE_SEARCH_MAX_ATTEMPTS = '5';

    const fetchMock = vi.fn().mockResolvedValue(makeRes({ ok: false, status: 500, statusText: 'Oops', text: 'nope' }));
    vi.stubGlobal('fetch', fetchMock);

    const { braveWebSearch, __internal } = await importModule();
    __internal.resetLimiterState();

    await expect(braveWebSearch({ query: 'q', apiKey: 'k' })).rejects.toThrow(/500/i);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('serializes starts to respect MIN_START_INTERVAL_MS', async () => {
    process.env.BRAVE_SEARCH_MIN_START_INTERVAL_MS = '1000';
    process.env.BRAVE_SEARCH_MAX_ATTEMPTS = '1';

    const fetchMock = vi.fn().mockResolvedValue(
      makeRes({
        ok: true,
        status: 200,
        json: { web: { results: [{ url: 'https://example.com/a', title: 'A' }] } },
      })
    );
    vi.stubGlobal('fetch', fetchMock);

    const { braveWebSearch, __internal } = await importModule();
    __internal.resetLimiterState();

    vi.useFakeTimers();

    const p1 = braveWebSearch({ query: 'q1', apiKey: 'k' });
    const p2 = braveWebSearch({ query: 'q2', apiKey: 'k' });

    // first starts immediately
    await vi.runAllTicks();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // second start is delayed
    await vi.advanceTimersByTimeAsync(999);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    await Promise.all([p1, p2]);
  });

  it('builds Brave query params and normalizes results', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      makeRes({
        ok: true,
        status: 200,
        json: {
          web: {
            results: [
              { url: 'https://example.com/1', title: 'One' },
              { url: 'https://example.com/2' },
              { title: 'Missing url' },
            ],
          },
        },
      })
    );
    vi.stubGlobal('fetch', fetchMock);

    const { braveWebSearch, __internal } = await importModule();
    __internal.resetLimiterState();

    const results = await braveWebSearch({
      query: 'HB4123 site:oregonlegislature.gov',
      apiKey: 'k',
      count: 7,
      country: 'US',
      searchLang: 'en',
      freshness: 'all',
    });

    const calledUrl = String(fetchMock.mock.calls[0]?.[0]);
    expect(calledUrl).toContain('https://api.search.brave.com/res/v1/web/search');
    expect(calledUrl).toContain('q=HB4123');
    expect(calledUrl).toContain('count=7');
    expect(calledUrl).toContain('country=US');
    expect(calledUrl).toContain('search_lang=en');
    expect(calledUrl).not.toContain('freshness=');

    // title falls back to url
    expect(results).toEqual([
      { title: 'One', url: 'https://example.com/1', description: undefined },
      { title: 'https://example.com/2', url: 'https://example.com/2', description: undefined },
    ]);
  });
});
