import { beforeEach, describe, expect, it, vi } from 'vitest';

const braveWebSearchMock = vi.fn();
vi.mock('@/lib/braveSearch', () => ({
  braveWebSearch: braveWebSearchMock,
}));

const openAICreateMock = vi.fn();
const getOpenAIClientMock = vi.fn(() => ({
  chat: {
    completions: {
      create: openAICreateMock,
    },
  },
}));
vi.mock('@/lib/openaiClient', () => ({
  getOpenAIClient: getOpenAIClientMock,
}));

import handler from './analyze';

type MockRes = ReturnType<typeof createMockRes>;

function createMockRes() {
  const headers: Record<string, string> = {};
  let statusCode: number | null = null;
  let body: any = undefined;

  const res = {
    setHeader(key: string, value: string) {
      headers[key] = value;
      return res;
    },
    status(code: number) {
      statusCode = code;
      return res;
    },
    json(data: any) {
      body = data;
      return res;
    },
    send(data: any) {
      body = data;
      return res;
    },

    // test helpers
    _get() {
      return { headers, statusCode, body };
    },
  };

  return res;
}

describe('api/analyze handler', () => {
  beforeEach(() => {
    braveWebSearchMock.mockReset();
    openAICreateMock.mockReset();
    getOpenAIClientMock.mockClear();

    process.env.BRAVE_SEARCH_API_KEY = 'brave';
    process.env.OPENAI_API_KEY = 'openai';

    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.useRealTimers();
  });

  it('rejects non-POST requests', async () => {
    const req: any = { method: 'GET', body: {} };
    const res = createMockRes();

    await handler(req, res as any);

    const out = res._get();
    expect(out.statusCode).toBe(405);
    expect(out.headers.Allow).toBe('POST');
    expect(out.body).toBe('Method not allowed');
  });

  it('validates request body', async () => {
    const req: any = { method: 'POST', body: {} };
    const res = createMockRes();

    await handler(req, res as any);

    const out = res._get();
    expect(out.statusCode).toBe(400);
    expect(out.body).toBe('Invalid request body');
  });

  it('returns 500 when env vars are missing', async () => {
    delete process.env.BRAVE_SEARCH_API_KEY;

    const req: any = { method: 'POST', body: { billId: 'HB4123' } };
    const res = createMockRes();

    await handler(req, res as any);

    const out = res._get();
    expect(out.statusCode).toBe(500);
    expect(out.body).toBe('Missing BRAVE_SEARCH_API_KEY');
  });

  it('returns 500 when OPENAI_API_KEY is missing', async () => {
    delete process.env.OPENAI_API_KEY;

    const req: any = { method: 'POST', body: { billId: 'HB4123' } };
    const res = createMockRes();

    await handler(req, res as any);

    const out = res._get();
    expect(out.statusCode).toBe(500);
    expect(out.body).toBe('Missing OPENAI_API_KEY');
  });

  it('returns 502 when all Brave domains fail', async () => {
    braveWebSearchMock.mockRejectedValue(new Error('rate limited'));

    const req: any = { method: 'POST', body: { billId: 'HB 4123' } };
    const res = createMockRes();

    await handler(req, res as any);

    const out = res._get();
    expect(out.statusCode).toBe(502);
    expect(String(out.body)).toContain('Unable to retrieve official sources');
  });

  it('returns 404 when Brave returns no usable results', async () => {
    braveWebSearchMock.mockResolvedValue([]);

    const req: any = { method: 'POST', body: { billId: 'HB4123' } };
    const res = createMockRes();

    await handler(req, res as any);

    const out = res._get();
    expect(out.statusCode).toBe(404);
    expect(String(out.body)).toContain('No official-source search results');
  });

  it('returns 500 when OpenAI returns invalid JSON', async () => {
    braveWebSearchMock.mockResolvedValue([{ title: 'T', url: 'https://example.com/a', description: 'D' }]);

    openAICreateMock.mockResolvedValue({
      choices: [{ message: { content: '{' } }],
    });

    const req: any = { method: 'POST', body: { billId: 'hb 4123' } };
    const res = createMockRes();

    await handler(req, res as any);

    const out = res._get();
    expect(out.statusCode).toBe(500);
    expect(out.body).toBe('OpenAI did not return valid JSON');
  });

  it('returns 500 when OpenAI returns empty content', async () => {
    braveWebSearchMock.mockResolvedValue([{ title: 'T', url: 'https://example.com/a', description: 'D' }]);

    openAICreateMock.mockResolvedValue({
      choices: [{ message: { content: '' } }],
    });

    const req: any = { method: 'POST', body: { billId: 'HB4123' } };
    const res = createMockRes();

    await handler(req, res as any);

    const out = res._get();
    expect(out.statusCode).toBe(500);
    expect(out.body).toBe('OpenAI returned empty response');
  });

  it('returns 500 when OpenAI returns JSON that fails schema validation', async () => {
    braveWebSearchMock.mockResolvedValue([{ title: 'T', url: 'https://example.com/a', description: 'D' }]);

    openAICreateMock.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ plainLanguageSummary: 'x' }) } }],
    });

    const req: any = { method: 'POST', body: { billId: 'HB4123' } };
    const res = createMockRes();

    await handler(req, res as any);

    const out = res._get();
    expect(out.statusCode).toBe(500);
    expect(typeof out.body).toBe('string');
  });

  it('returns 200 with validated payload on success', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2020-01-01T00:00:00.000Z'));

    // 4 domains; succeed on first, fail on second, succeed on third/fourth
    braveWebSearchMock
      .mockResolvedValueOnce([
        { title: 'A', url: 'https://example.com/a', description: 'D1' },
        { title: 'Dup', url: 'https://example.com/dup', description: 'x' },
      ])
      .mockRejectedValueOnce(new Error('fail domain'))
      .mockResolvedValueOnce([
        { title: 'Dup2', url: 'https://example.com/dup ', description: 'y' },
        { title: 'B', url: 'https://example.com/b', description: 'D2' },
      ])
      .mockResolvedValueOnce([{ title: 'C', url: 'https://example.com/c' }]);

    openAICreateMock.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              plainLanguageSummary: 'Summary',
              pros: ['p1'],
              cons: ['c1'],
              whoBenefits: ['w1'],
              whoMightBeHarmed: ['h1'],
              debate: { proVoice: 'pro', conVoice: 'con' },
              uncertainties: ['u1'],
            }),
          },
        },
      ],
    });

    const req: any = { method: 'POST', body: { billId: ' hb 4123 ' } };
    const res = createMockRes();

    await handler(req, res as any);

    const out = res._get();
    expect(out.statusCode).toBe(200);
    expect(out.headers['Cache-Control']).toBe('no-store');

    expect(out.body.billId).toBe('HB4123');
    expect(out.body.sources.map((s: any) => s.url)).toEqual([
      'https://example.com/a',
      'https://example.com/dup',
      'https://example.com/b',
      'https://example.com/c',
    ]);
    expect(out.body.generatedAtIso).toBe('2020-01-01T00:00:00.000Z');

    expect(braveWebSearchMock).toHaveBeenCalledTimes(4);

    // sanity: Brave called with billId + site:
    expect(braveWebSearchMock.mock.calls[0][0].query).toContain('HB4123');
    expect(braveWebSearchMock.mock.calls[0][0].query).toContain('site:');
  });
});
