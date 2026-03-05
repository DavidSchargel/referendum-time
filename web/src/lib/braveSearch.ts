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

  const res = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
      'X-Subscription-Token': apiKey,
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Brave Search error: ${res.status} ${res.statusText}${body ? ` – ${body}` : ''}`);
  }

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
