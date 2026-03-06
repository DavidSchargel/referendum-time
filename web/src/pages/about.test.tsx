import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import AboutPage from './about';

describe('AboutPage', () => {
  it('renders methodology content', () => {
    render(<AboutPage />);

    expect(screen.getByRole('heading', { name: 'About / Methodology' })).toBeInTheDocument();
    expect(screen.getByText(/What this site does/)).toBeInTheDocument();
    expect(screen.getByText(/Guardrails/)).toBeInTheDocument();
    expect(screen.getByText(/Privacy/)).toBeInTheDocument();
  });
});
