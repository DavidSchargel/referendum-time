import { describe, expect, it } from 'vitest';

import { normalizeBillId } from './normalizeBillId';

describe('normalizeBillId', () => {
  it('trims, uppercases, and removes whitespace', () => {
    expect(normalizeBillId(' hb  4123 ')).toBe('HB4123');
    expect(normalizeBillId('\n sb  1\t')).toBe('SB1');
  });
});
