import { onlyDigits } from '@design-system';

import { firstCharacters } from '../sequence';

const MAX_ZIP_DIGITS = 8;
const PREFIX_LENGTH = 5;

/** Formata `00000-000`. */
export function maskZipCode(value: string): string {
  const digits = firstCharacters(onlyDigits(value), MAX_ZIP_DIGITS);

  if (digits.length <= PREFIX_LENGTH) return digits;

  return `${firstCharacters(digits, PREFIX_LENGTH)}-${digits.slice(PREFIX_LENGTH)}`;
}
