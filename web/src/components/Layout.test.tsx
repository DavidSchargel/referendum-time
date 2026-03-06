import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Layout } from './Layout';

describe('Layout', () => {
  it('renders title, nav, skip link, and footer', () => {
    const { container } = render(
      <Layout title="Home">
        <div>Child</div>
      </Layout>
    );

    expect(container.querySelector('title')?.textContent).toBe('Home | Referendum Time');
    expect(container.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex,nofollow');

    expect(screen.getByRole('link', { name: 'Skip to content' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Referendum Time' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'About / Methodology' })).toHaveAttribute('href', '/about');

    expect(screen.getByText(/Disclaimer:/)).toBeInTheDocument();
    expect(screen.getByText('Child')).toBeInTheDocument();
  });
});
