import { maskBirthDate } from './birthDateMask';
import { maskPhone } from './phoneMask';
import { maskZipCode } from './zipCodeMask';

describe('maskBirthDate', () => {
  it.each([
    ['', ''],
    ['2', '2'],
    ['22', '22'],
    ['220', '22/0'],
    ['2205', '22/05'],
    ['22051999', '22/05/1999'],
  ])('should format %s as %s', (input, expected) => {
    expect(maskBirthDate(input)).toBe(expected);
  });

  it('should ignore digits beyond the eighth', () => {
    expect(maskBirthDate('2205199999')).toBe('22/05/1999');
  });

  it('should reformat a value that already carries separators', () => {
    expect(maskBirthDate('22/05/1999')).toBe('22/05/1999');
  });
});

describe('maskZipCode', () => {
  it.each([
    ['', ''],
    ['01001', '01001'],
    ['010010', '01001-0'],
    ['01001000', '01001-000'],
    ['010010009', '01001-000'],
  ])('should format %s as %s', (input, expected) => {
    expect(maskZipCode(input)).toBe(expected);
  });
});

describe('maskPhone', () => {
  it.each([
    ['', ''],
    ['1', '(1'],
    ['11', '(11'],
    ['1191', '(11) 91'],
    ['1123456789', '(11) 2345-6789'],
    ['11912345678', '(11) 91234-5678'],
  ])('should format %s as %s', (input, expected) => {
    expect(maskPhone(input)).toBe(expected);
  });

  it('should move the dash when the number grows from landline to mobile', () => {
    expect(maskPhone('1123456789')).toBe('(11) 2345-6789');
    expect(maskPhone('11234567890')).toBe('(11) 23456-7890');
  });

  it('should ignore digits beyond the eleventh', () => {
    expect(maskPhone('119123456789999')).toBe('(11) 91234-5678');
  });
});
