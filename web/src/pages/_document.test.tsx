import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/document', () => ({
  Html: ({ lang, children }: { lang: string; children: React.ReactNode }) => <html lang={lang}>{children}</html>,
  Head: ({ children }: { children: React.ReactNode }) => <head>{children}</head>,
  Main: () => <main />,
  NextScript: () => <script />,
}));

import Document from './_document';

describe('Document', () => {
  it('includes robots meta', () => {
    const html = renderToStaticMarkup(<Document />);
    expect(html).toContain('noindex,nofollow');
    expect(html).toContain('lang="en"');
  });
});
