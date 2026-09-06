import { formatDateTime, maskDateTime, parseDateTime, parseDateTimeSoFar } from '.';

describe('maskDateTime', () => {
  it.each([
    ['', ''],
    ['2', '2'],
    ['2205', '22/05'],
    ['22051999', '22/05/1999'],
    ['220519991', '22/05/1999 1'],
    ['2205199918', '22/05/1999 18'],
    ['22051999183', '22/05/1999 18:3'],
    ['220519991830', '22/05/1999 18:30'],
  ])('should format %s as %s', (input, expected) => {
    expect(maskDateTime(input)).toBe(expected);
  });

  it('should ignore digits beyond the twelfth', () => {
    expect(maskDateTime('22051999183099')).toBe('22/05/1999 18:30');
  });

  it('should reformat a value that already carries separators', () => {
    expect(maskDateTime('22/05/1999 18:30')).toBe('22/05/1999 18:30');
  });
});

describe('parseDateTime', () => {
  it('should read a complete departure and refuse an impossible one', () => {
    expect(parseDateTime('22/05/1999 18:30')?.getHours()).toBe(18);
    expect(parseDateTime('22/05/1999 25:30')).toBeNull();
    expect(parseDateTime('32/05/1999 18:30')).toBeNull();
    expect(parseDateTime('22/05/1999')).toBeNull();
  });
});

describe('formatDateTime', () => {
  it('should write the departure in the product format', () => {
    expect(formatDateTime(new Date(1999, 4, 22, 18, 30))).toBe('22/05/1999 18:30');
  });
});

describe('parseDateTimeSoFar', () => {
  it('should fall back to the day alone while the hour is still missing', () => {
    expect(parseDateTimeSoFar('22/05/1999 18:30')).toEqual(new Date(1999, 4, 22, 18, 30));
    expect(parseDateTimeSoFar('22/05/1999 18')).toEqual(new Date(1999, 4, 22));
    expect(parseDateTimeSoFar('22/05/1999')).toEqual(new Date(1999, 4, 22));
    expect(parseDateTimeSoFar('22/05')).toBeNull();
  });
});
