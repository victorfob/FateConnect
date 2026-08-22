import { describe, expect, it } from 'vitest';

import { fromFormDate, toApiDate, toFormDate } from './apiDate';

describe('toApiDate', () => {
  it('should pad the day and the month to two digits', () => {
    expect(toApiDate(new Date(2026, 4, 7))).toBe('2026-05-07');
  });

  it('should keep the local day, without shifting by timezone', () => {
    expect(toApiDate(new Date(2026, 0, 1))).toBe('2026-01-01');
    expect(toApiDate(new Date(2026, 11, 31))).toBe('2026-12-31');
  });
});

describe('toFormDate', () => {
  it('should format a valid date', () => {
    expect(toFormDate(new Date(2026, 4, 7))).toBe('2026-05-07');
  });

  it('should fall back to an empty value for no date and for a half typed one', () => {
    expect(toFormDate(null)).toBe('');
    expect(toFormDate(new Date('nope'))).toBe('');
  });
});

describe('fromFormDate', () => {
  it('should read back the date the form stored', () => {
    expect(fromFormDate('2026-05-07')).toEqual(new Date(2026, 4, 7));
  });

  it('should return null for an empty or unreadable value', () => {
    expect(fromFormDate('')).toBeNull();
    expect(fromFormDate('07/05/2026')).toBeNull();
  });
});
