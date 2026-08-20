import { onlyDigits } from './caret';

const MAX_DATE_DIGITS = 8;
const DAY_END = 2;
const MONTH_END = 4;

/** Formata `dd/mm/aaaa` progressivamente, descartando o que passar de 8 dígitos. */
export function maskBirthDate(value: string): string {
  const digits = onlyDigits(value).slice(0, MAX_DATE_DIGITS);

  if (digits.length <= DAY_END) return digits;
  if (digits.length <= MONTH_END) return `${digits.slice(0, DAY_END)}/${digits.slice(DAY_END)}`;

  return `${digits.slice(0, DAY_END)}/${digits.slice(DAY_END, MONTH_END)}/${digits.slice(MONTH_END)}`;
}
