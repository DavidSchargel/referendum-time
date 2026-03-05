import { Layout } from '@/components/Layout';

export default function AboutPage() {
  return (
    <Layout title="About">
      <h1 className="text-2xl font-semibold tracking-tight">About / Methodology</h1>

      <div className="mt-6 max-w-3xl space-y-8 text-sm leading-6 text-slate-800">
        <section className="space-y-2">
          <h2 className="text-base font-semibold">What this site does</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Uses Brave Search to find official sources related to a bill (e.g., oregonlegislature.gov, sos.oregon.gov).</li>
            <li>Shows links and short snippets (no full-text scraping displayed).</li>
            <li>Uses an LLM to generate an informational summary and a “Pro voice vs Con voice” discussion.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold">Guardrails</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>No “support/oppose” directives. The output is informational and includes uncertainties.</li>
            <li>May be incomplete or wrong. Always verify using the linked sources.</li>
            <li>Not legal advice.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold">Accessibility</h2>
          <p>
            The UI is designed to meet WCAG 2.1 AA basics: semantic landmarks, keyboard navigation, and sufficient color
            contrast. If you find an accessibility issue, it should be fixed.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold">Privacy</h2>
          <p>
            API keys are kept server-side in <code className="rounded bg-slate-100 px-1 py-0.5">.env.local</code>. This
            project is intended to run locally.
          </p>
        </section>
      </div>
    </Layout>
  );
}
