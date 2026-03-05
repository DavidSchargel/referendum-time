import { useRouter } from 'next/router';
import { useState } from 'react';

import { Layout } from '@/components/Layout';

export default function HomePage() {
  const router = useRouter();
  const [billId, setBillId] = useState('HB4123');

  return (
    <Layout title="Home">
      <h1 className="text-2xl font-semibold tracking-tight">HB 4123 evaluator</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-700">
        Enter an Oregon bill ID (example: HB4123). The site will use Brave Search to collect links/snippets from official
        sources, then generate a plain-language summary and an informational “Pro voice vs Con voice” debate.
      </p>

      <form
        className="mt-6 max-w-xl rounded-lg border border-slate-200 bg-white p-4"
        onSubmit={(e) => {
          e.preventDefault();
          const normalized = billId.trim().toUpperCase().replace(/\s+/g, '');
          if (!normalized) return;
          void router.push(`/bill/${encodeURIComponent(normalized)}`);
        }}
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="billId" className="text-sm font-medium">
            Bill ID
          </label>
          <div className="flex gap-2">
            <input
              id="billId"
              name="billId"
              className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm"
              inputMode="text"
              autoComplete="off"
              value={billId}
              onChange={(e) => setBillId(e.target.value)}
            />
            <button
              type="submit"
              className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              View
            </button>
          </div>
          <p className="text-xs text-slate-600">Example: HB4123 (no space). You can change this later.</p>
        </div>
      </form>

      <section className="mt-10 max-w-2xl">
        <h2 className="text-lg font-semibold">Persona used for the evaluation</h2>
        <ul className="mt-3 list-disc pl-5 text-sm text-slate-700">
          <li>Unemployed family of three</li>
          <li>Low income (~$32k/year), renters</li>
          <li>Portland, Oregon (ZIP 97206)</li>
          <li>Healthcare: ACA + Oregon Health Plan</li>
        </ul>
      </section>
    </Layout>
  );
}
