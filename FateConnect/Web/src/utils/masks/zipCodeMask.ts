import { onlyDigits } from './caret';

const MAX_ZIP_DIGITS = 8;
const PREFIX_LENGTH = 5;

/** Formata `00000-000`. */
export function maskZipCode(value: string): string {
  const digits = onlyDigits(value).slice(0, MAX_ZIP_DIGITS);

  if (digits.length <= PREFIX_LENGTH) return digits;

  return `${digits.slice(0, PREFIX_LENGTH)}-${digits.slice(PREFIX_LENGTH)}`;
}
