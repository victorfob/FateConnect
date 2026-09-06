import { toApiDate, toApiDateText, toDisplayDate } from './apiDate';

describe('toApiDate', () => {
  it('should pad the day and the month to two digits', () => {
    expect(toApiDate(new Date(2026, 4, 7))).toBe('2026-05-07');
  });

  it('should keep the local day, without shifting by timezone', () => {
    expect(toApiDate(new Date(2026, 0, 1))).toBe('2026-01-01');
    expect(toApiDate(new Date(2026, 11, 31))).toBe('2026-12-31');
  });
});

describe('toApiDateText', () => {
  it('should turn what the field shows into what the API stores', () => {
    expect(toApiDateText('07/05/2026')).toBe('2026-05-07');
  });

  it('should fall back to an empty value for no date and for a half typed one', () => {
    expect(toApiDateText('')).toBe('');
    expect(toApiDateText('07/0')).toBe('');
    expect(toApiDateText('32/05/2026')).toBe('');
  });
});

describe('toDisplayDate', () => {
  it('should read back the date the form stored', () => {
    expect(toDisplayDate('2026-05-07')).toBe('07/05/2026');
  });

  it('should return an empty value for an empty or unreadable one', () => {
    expect(toDisplayDate('')).toBe('');
    expect(toDisplayDate('nope')).toBe('');
  });
});
