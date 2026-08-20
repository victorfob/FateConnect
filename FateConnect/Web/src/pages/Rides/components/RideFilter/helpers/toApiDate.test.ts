import { describe, expect, it } from 'vitest';

import { toApiDate } from './toApiDate';

describe('toApiDate', () => {
  it('should pad the day and the month to two digits', () => {
    expect(toApiDate(new Date(2026, 4, 7))).toBe('2026-05-07');
  });

  it('should keep the local day, without shifting by timezone', () => {
    expect(toApiDate(new Date(2026, 0, 1))).toBe('2026-01-01');
    expect(toApiDate(new Date(2026, 11, 31))).toBe('2026-12-31');
  });
});
