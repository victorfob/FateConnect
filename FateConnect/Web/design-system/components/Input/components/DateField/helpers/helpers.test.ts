import { formatDate, maskDate, parseDate } from '.';

describe('maskDate', () => {
  it.each([
    ['', ''],
    ['2', '2'],
    ['22', '22'],
    ['220', '22/0'],
    ['2205', '22/05'],
    ['22051999', '22/05/1999'],
  ])('should format %s as %s', (input, expected) => {
    expect(maskDate(input)).toBe(expected);
  });

  it('should ignore digits beyond the eighth', () => {
    expect(maskDate('2205199999')).toBe('22/05/1999');
  });

  it('should reformat a value that already carries separators', () => {
    expect(maskDate('22/05/1999')).toBe('22/05/1999');
  });
});

describe('parseDate', () => {
  it('should read a complete date and refuse an impossible one', () => {
    expect(parseDate('22/05/1999')?.getFullYear()).toBe(1999);
    expect(parseDate('32/05/1999')).toBeNull();
    expect(parseDate('22/05')).toBeNull();
  });
});

describe('formatDate', () => {
  it('should write the date in the product format', () => {
    expect(formatDate(new Date(1999, 4, 22))).toBe('22/05/1999');
  });
});
