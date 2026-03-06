import type { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useCallback, useState } from 'react';

import { Layout } from '@/components/Layout';
import type { Analysis } from '@/lib/analysisSchema';

export const getServerSideProps: GetServerSideProps<{ billId: string }> = async (ctx) => {
  const billId = typeof ctx.params?.billId === 'string' ? ctx.params.billId : '';
  return { props: { billId } };
};

export default function BillPage({ billId }: { billId: string }) {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async () => {
    if (!billId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billId }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `Request failed: ${res.status}`);
      }

      const json = (await res.json()) as Analysis;
      setAnalysis(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [billId]);

  return (
    <Layout title={billId ? billId : 'Bill'}>
      <div className="flex flex-col gap-2">
        <p className="text-xs text-slate-600">
          <Link href="/" className="underline underline-offset-4">
            Home
          </Link>
          <span aria-hidden="true"> / </span>
          <span>{billId || '...'}</span>
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">{billId || 'Missing bill ID'}</h1>
      </div>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-base font-semibold">Generate analysis</h2>
        <p className="mt-2 text-sm text-slate-700">
          This will call Brave Search (official sources only) and then generate an informational summary + “Pro voice vs
          Con voice” discussion using an LLM.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void generate()}
            disabled={loading || !billId}
            className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Generating…' : analysis ? 'Refresh analysis' : 'Generate analysis'}
          </button>

          {analysis?.generatedAtIso ? (
            <p className="text-xs text-slate-600">Generated: {new Date(analysis.generatedAtIso).toLocaleString()}</p>
          ) : null}
        </div>

        {error ? (
          <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
            {error}
          </div>
        ) : null}
      </section>

      <section className="mt-8 max-w-3xl">
        <h2 className="text-lg font-semibold">Persona used</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
          <li>Unemployed family of three</li>
          <li>Low income (~$32k/year), renters</li>
          <li>Portland, OR 97206</li>
          <li>Healthcare: ACA + Oregon Health Plan</li>
        </ul>
      </section>

      {analysis ? (
        <div className="mt-10 space-y-10">
          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-lg font-semibold">Plain-language summary</h2>
            <p className="mt-3 text-sm leading-6 text-slate-800">{analysis.plainLanguageSummary}</p>
            {analysis.uncertainties?.length ? (
              <div className="mt-4">
                <h3 className="text-sm font-semibold">Uncertainties / missing info</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                  {analysis.uncertainties.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h2 className="text-lg font-semibold">Pros (from sources + analysis)</h2>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-800">
                {analysis.pros.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h2 className="text-lg font-semibold">Cons (from sources + analysis)</h2>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-800">
                {analysis.cons.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h2 className="text-lg font-semibold">Who benefits?</h2>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-800">
                {analysis.whoBenefits.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h2 className="text-lg font-semibold">Who might be harmed?</h2>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-800">
                {analysis.whoMightBeHarmed.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-lg font-semibold">Two-voice discussion (informational)</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold">Pro voice</h3>
                <p className="mt-2 text-sm leading-6 text-slate-800">{analysis.debate.proVoice}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold">Con voice</h3>
                <p className="mt-2 text-sm leading-6 text-slate-800">{analysis.debate.conVoice}</p>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-lg font-semibold">Sources used</h2>
            <ul className="mt-3 space-y-3">
              {analysis.sources.map((s, i) => (
                <li key={i} className="rounded border border-slate-200 bg-slate-50 p-3">
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-slate-900 underline underline-offset-4"
                  >
                    {s.title || s.url}
                  </a>
                  {s.description ? <p className="mt-1 text-xs text-slate-700">{s.description}</p> : null}
                  <p className="mt-1 break-all text-xs text-slate-600">{s.url}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : (
        <section className="mt-10 rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">No analysis yet</h2>
          <p className="mt-2 text-sm text-slate-700">Click “Generate analysis” to fetch sources and produce an output.</p>
        </section>
      )}
    </Layout>
  );
}
