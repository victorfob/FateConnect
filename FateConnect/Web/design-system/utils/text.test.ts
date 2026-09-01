import { caretAfterDigitCount, countDigits, onlyDigits } from './text';

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
