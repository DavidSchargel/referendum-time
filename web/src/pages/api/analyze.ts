import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

import { braveWebSearch } from '@/lib/braveSearch';
import { getOpenAIClient } from '@/lib/openaiClient';
import { AnalysisSchema, type SourceItem } from '@/lib/analysisSchema';
import { normalizeBillId } from '@/lib/normalizeBillId';

const RequestSchema = z.object({
  billId: z.string().min(2).max(32),
});

const LLMOutputSchema = z.object({
  plainLanguageSummary: z.string(),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  whoBenefits: z.array(z.string()),
  whoMightBeHarmed: z.array(z.string()),
  debate: z.object({
    proVoice: z.string(),
    conVoice: z.string(),
  }),
  uncertainties: z.array(z.string()),
});

function uniqByUrl(items: SourceItem[]): SourceItem[] {
  const seen = new Set<string>();
  const out: SourceItem[] = [];
  for (const it of items) {
    const key = it.url.trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(it);
  }
  return out;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).send('Method not allowed');
  }

  const parsed = RequestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).send('Invalid request body');

  const billId = normalizeBillId(parsed.data.billId);

  const braveKey = process.env.BRAVE_SEARCH_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  if (!braveKey) return res.status(500).send('Missing BRAVE_SEARCH_API_KEY');
  if (!openAiKey) return res.status(500).send('Missing OPENAI_API_KEY');

  // Sources to search.
  // Start with official state/legislative sources, but include a couple of local journalism outlets
  // to help surface pro/con framing when official pages are sparse.
  const domains = [
    'oregonlegislature.gov',
    'olis.oregonlegislature.gov',
    'sos.oregon.gov',
    'oregon.gov',
    'kgw.com',
    'portlandmercury.com',
  ];

  try {
    // Collect sources sequentially to be tolerant of per-domain failures
    const collected: SourceItem[] = [];
    let successfulDomains = 0;

    for (const domain of domains) {
      try {
        const query = `${billId} site:${domain}`;
        const results = await braveWebSearch({
          query,
          count: 5,
          apiKey: braveKey,
          country: 'US',
          searchLang: 'en',
          freshness: 'all',
        });
        const mapped = results.map((r): SourceItem => ({
          title: r.title,
          url: r.url,
          description: r.description,
        }));
        collected.push(...mapped);
        successfulDomains++;
      } catch (err) {
        // Continue to next domain; log for visibility
        console.warn(`Brave search failed for domain ${domain}:`, err instanceof Error ? err.message : err);
      }
    }

    // If no domain succeeded, fail gracefully
    if (successfulDomains === 0) {
      return res.status(502).send(
        'Unable to retrieve official sources from Brave Search for any configured domain after retries. Please try again in a few seconds.'
      );
    }

    const sources = uniqByUrl(collected).slice(0, 12);

    // If no usable sources remain, fail gracefully
    if (sources.length === 0) {
      return res.status(404).send(`No official-source search results were found for ${billId}.`);
    }

    const persona = {
      location: 'Portland, Oregon 97206',
      household: 'Unemployed family of three',
      income: '$32k/year (approx)',
      housing: 'Renters',
      healthcare: 'ACA + Oregon Health Plan',
    };

    const system =
      'You are an Oregon legislative explainer. You write at an 8th grade reading level, clearly and calmly. ' +
      'You must be informational: do not tell the reader to support/oppose, and do not give voting directives. ' +
      'If the sources are thin, say what is unknown.';

    const user = [
      `Bill: ${billId} (Oregon Legislature)`,
      '',
      'Persona (for impact framing):',
      `- Location: ${persona.location}`,
      `- Household: ${persona.household}`,
      `- Income: ${persona.income}`,
      `- Housing: ${persona.housing}`,
      `- Healthcare: ${persona.healthcare}`,
      '',
      'Sources. Use ONLY these snippets; do not invent facts:',
      ...sources.map((s, i) => `#${i + 1} ${s.title}\n${s.url}\n${s.description ?? ''}`.trim()),
      '',
      'Task:',
      '1) Write a plain-language summary of what the bill appears to do (8th grade level).',
      '2) List likely pros and cons (bullets). If a claim is not supported by the snippets, mark it as an uncertainty.',
      '3) Identify who benefits and who might be harmed (bullets).',
      '4) Create an informational two-voice discussion: a “Pro voice” and a “Con voice”. Each should be a short paragraph focused on impacts to the persona.',
      '5) Provide an uncertainties list (bullets) stating what you could not confirm from the snippets.',
      '',
      'Output STRICT JSON with this shape:',
      '{',
      '  "plainLanguageSummary": string,',
      '  "pros": string[],',
      '  "cons": string[],',
      '  "whoBenefits": string[],',
      '  "whoMightBeHarmed": string[],',
      '  "debate": { "proVoice": string, "conVoice": string },',
      '  "uncertainties": string[]',
      '}',
    ].join('\n');

    const client = getOpenAIClient(openAiKey);
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('OpenAI returned empty response');

    let data: unknown;
    try {
      data = JSON.parse(content);
    } catch {
      throw new Error('OpenAI did not return valid JSON');
    }

    const llm = LLMOutputSchema.parse(data);

    const full = {
      billId,
      ...llm,
      sources,
      generatedAtIso: new Date().toISOString(),
    };

    const validated = AnalysisSchema.parse(full);

    // No caching by request. (Client can refresh manually.)
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(validated);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return res.status(500).send(msg);
  }
}
