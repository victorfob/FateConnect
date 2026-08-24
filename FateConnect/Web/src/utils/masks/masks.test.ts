import { maskBirthDate } from './birthDateMask';
import { caretAfterDigitCount, countDigits, onlyDigits } from './caret';
import { maskPhone } from './phoneMask';
import { maskZipCode } from './zipCodeMask';

describe('onlyDigits', () => {
  it('should drop every character that is not a digit', () => {
    expect(onlyDigits('(11) 91234-5678')).toBe('11912345678');
    expect(countDigits('22/05/1999')).toBe(8);
  });
});

describe('caretAfterDigitCount', () => {
  it('should place the caret right after the requested digit', () => {
    // "22/05/1999": o 2º dígito termina no índice 2, o 3º no índice 4.
    expect(caretAfterDigitCount('22/05/1999', 2)).toBe(2);
    expect(caretAfterDigitCount('22/05/1999', 3)).toBe(4);
  });

  it('should keep the caret at the start when no digit precedes it', () => {
    expect(caretAfterDigitCount('22/05/1999', 0)).toBe(0);
  });

  it('should fall back to the end when the value has fewer digits', () => {
    expect(caretAfterDigitCount('22/05', 8)).toBe(5);
  });
});

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
