import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/styles/globals.css', () => ({}));

import App from './_app';

describe('App', () => {
  it('renders the active page component', () => {
    render(
      <App
        Component={() => <div>Page</div>}
        pageProps={{}}
        // next/app props
        router={{} as any}
      />
    );

    expect(screen.getByText('Page')).toBeInTheDocument();
  });
});
