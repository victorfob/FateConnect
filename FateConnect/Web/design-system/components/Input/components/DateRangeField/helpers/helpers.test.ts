import { formatDateRange, isDayBefore, maskDateRange, parseRangeSoFar } from '.';

const RANGE_START = new Date(2026, 4, 22);
const RANGE_END = new Date(2026, 4, 25);

describe('maskDateRange', () => {
  it.each([
    ['', ''],
    ['2205', '22/05'],
    ['22052026', '22/05/2026'],
    ['220520262', '22/05/2026 - 2'],
    ['2205202625052026', '22/05/2026 - 25/05/2026'],
  ])('should format %s as %s', (input, expected) => {
    expect(maskDateRange(input)).toBe(expected);
  });

  it('should ignore digits beyond the sixteenth', () => {
    expect(maskDateRange('220520262505202699')).toBe('22/05/2026 - 25/05/2026');
  });

  it('should reformat a value that already carries separators', () => {
    expect(maskDateRange('22/05/2026 - 25/05/2026')).toBe('22/05/2026 - 25/05/2026');
  });
});

describe('formatDateRange', () => {
  it('should join both dates with the spaced hyphen the product writes', () => {
    expect(formatDateRange(RANGE_START, RANGE_END)).toBe('22/05/2026 - 25/05/2026');
  });
});

// Sem ela o mesmo dia pareceria anterior a si mesmo quando as duas datas
// carregam horas diferentes, e o período de um dia deixaria de fechar.
describe('isDayBefore', () => {
  it('should compare calendar days, not instants', () => {
    expect(isDayBefore(new Date(2026, 4, 22, 0, 0), new Date(2026, 4, 22, 23, 59))).toBe(false);
    expect(isDayBefore(new Date(2026, 4, 21, 23, 59), new Date(2026, 4, 22, 0, 0))).toBe(true);
  });
});

describe('parseRangeSoFar', () => {
  it('should read a complete range', () => {
    expect(parseRangeSoFar('22/05/2026 - 25/05/2026')).toEqual({
      start: RANGE_START,
      end: RANGE_END,
    });
  });

  it('should accept the same day at both ends', () => {
    expect(parseRangeSoFar('22/05/2026 - 22/05/2026')).toEqual({
      start: RANGE_START,
      end: RANGE_START,
    });
  });

  it('should hold the start alone while the end is still being typed', () => {
    expect(parseRangeSoFar('22/05/2026 - 25/05')).toEqual({ start: RANGE_START, end: null });
    expect(parseRangeSoFar('22/05/2026')).toEqual({ start: RANGE_START, end: null });
  });

  it('should refuse an end that falls before the start', () => {
    expect(parseRangeSoFar('22/05/2026 - 21/05/2026')).toEqual({ start: RANGE_START, end: null });
  });

  it('should read nothing while the start does not close a date', () => {
    expect(parseRangeSoFar('')).toEqual({ start: null, end: null });
    expect(parseRangeSoFar('32/05/2026 - 25/05/2026')).toEqual({ start: null, end: null });
  });
});
