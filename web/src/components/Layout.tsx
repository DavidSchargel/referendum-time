import Head from 'next/head';
import Link from 'next/link';
import type { ReactNode } from 'react';

export function Layout({ title, children }: { title?: string; children: ReactNode }) {
  const pageTitle = title ? `${title} | Referendum Time` : 'Referendum Time';

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        {/* No SEO: explicitly prevent indexing */}
        <meta name="robots" content="noindex,nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Skip link for keyboard users */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:text-slate-900 focus:shadow"
      >
        Skip to content
      </a>

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/" className="font-semibold text-slate-900">
            Referendum Time
          </Link>
          <nav aria-label="Primary" className="flex items-center gap-4">
            <Link href="/about" className="text-sm text-slate-700 underline-offset-4 hover:underline">
              About / Methodology
            </Link>
          </nav>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-5xl px-4 py-8">
        {children}
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <p className="text-xs text-slate-600">
            Disclaimer: This site is for informational purposes only and may be incomplete or inaccurate. It is not legal
            advice.
          </p>
        </div>
      </footer>
    </>
  );
}
