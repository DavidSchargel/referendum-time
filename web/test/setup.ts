import React from 'react';

import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Make next/head render its children into the tree (so <title>/<meta> are queryable).
vi.mock('next/head', () => ({
  default: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
}));

// Make next/link render a simple anchor.
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: any; children: React.ReactNode }) => {
    const resolved = typeof href === 'string' ? href : href?.pathname ?? '';
    return React.createElement('a', { href: resolved, ...rest }, children);
  },
}));
