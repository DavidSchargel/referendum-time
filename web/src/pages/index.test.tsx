import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const pushMock = vi.fn();
vi.mock('next/router', () => ({
  useRouter: () => ({ push: pushMock }),
}));

import HomePage from './index';

describe('HomePage', () => {
  beforeEach(() => {
    pushMock.mockReset();
  });

  it('normalizes billId and navigates on submit', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    const input = screen.getByLabelText('Bill ID');
    await user.clear(input);
    await user.type(input, ' hb  4123 ');

    await user.click(screen.getByRole('button', { name: 'View' }));

    expect(pushMock).toHaveBeenCalledWith('/bill/HB4123');
  });

  it('does not navigate for empty input', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    const input = screen.getByLabelText('Bill ID');
    await user.clear(input);
    await user.type(input, '   ');

    await user.click(screen.getByRole('button', { name: 'View' }));

    expect(pushMock).not.toHaveBeenCalled();
  });
});
