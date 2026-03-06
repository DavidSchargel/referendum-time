import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import BillPage, { getServerSideProps } from './[billId]';

describe('BillPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });
  it('getServerSideProps passes billId from params', async () => {
    const out = await getServerSideProps({ params: { billId: 'HB4123' } } as any);
    expect(out).toEqual({ props: { billId: 'HB4123' } });
  });

  it('renders initial state and disables generate when billId is missing', () => {
    render(<BillPage billId="" />);

    expect(screen.getByRole('heading', { name: 'Missing bill ID' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Generate analysis' })).toBeDisabled();
    expect(screen.getByText('No analysis yet')).toBeInTheDocument();
  });

  it('generates and renders analysis on success', async () => {
    const user = userEvent.setup();

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        billId: 'HB4123',
        plainLanguageSummary: 'Summary',
        pros: ['p1'],
        cons: ['c1'],
        whoBenefits: ['w1'],
        whoMightBeHarmed: ['h1'],
        debate: { proVoice: 'pro', conVoice: 'con' },
        uncertainties: ['u1'],
        sources: [{ title: 'S', url: 'https://example.com', description: 'D' }],
        generatedAtIso: '2020-01-01T00:00:00.000Z',
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<BillPage billId="HB4123" />);

    await user.click(screen.getByRole('button', { name: 'Generate analysis' }));

    expect(fetchMock).toHaveBeenCalledWith('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ billId: 'HB4123' }),
    });

    expect(await screen.findByText('Plain-language summary')).toBeInTheDocument();
    expect(screen.getByText('Summary')).toBeInTheDocument();
    expect(screen.getByText('Pros (from sources + analysis)')).toBeInTheDocument();
    expect(screen.getByText('p1')).toBeInTheDocument();
    expect(screen.getByText('Sources used')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'S' })).toHaveAttribute('href', 'https://example.com');

    // avoid locale-specific assertions
    expect(screen.getByText(/Generated:/)).toBeInTheDocument();
  });

  it('shows an error when the API request fails', async () => {
    const user = userEvent.setup();

    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'Nope',
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<BillPage billId="HB4123" />);

    await user.click(screen.getByRole('button', { name: 'Generate analysis' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Nope');
  });

  it('shows an error when fetch throws and clears loading state', async () => {
    const user = userEvent.setup();

    const fetchMock = vi.fn().mockRejectedValue(new Error('Network down'));
    vi.stubGlobal('fetch', fetchMock);

    render(<BillPage billId="HB4123" />);

    await user.click(screen.getByRole('button', { name: 'Generate analysis' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Network down');

    // button text returns from loading state
    expect(screen.getByRole('button', { name: 'Generate analysis' })).toBeEnabled();
  });
});
