import { format, isValid, parse } from 'date-fns';

import { onlyDigits } from '@ds-root/utils/text';

import { MASKED_DATE_LENGTH } from '../constants';

const DATE_FORMAT = 'dd/MM/yyyy';
const TEXT_START = 0;
const MAX_DATE_DIGITS = 8;
const DAY_END = 2;
const MONTH_END = 4;

/** Formata `dd/mm/aaaa` progressivamente, descartando o que passar de 8 dígitos. */
export function maskDate(value: string): string {
  const digits = onlyDigits(value).slice(TEXT_START, MAX_DATE_DIGITS);

  if (digits.length <= DAY_END) return digits;
  if (digits.length <= MONTH_END)
    return `${digits.slice(TEXT_START, DAY_END)}/${digits.slice(DAY_END)}`;

  return `${digits.slice(TEXT_START, DAY_END)}/${digits.slice(DAY_END, MONTH_END)}/${digits.slice(MONTH_END)}`;
}

/**
 * Converte `dd/mm/aaaa` em data, ou `null` quando o texto não é uma data real.
 * Texto incompleto é `null` de propósito: `25/12/20` seria lido como o ano 20.
 */
export function parseDate(value: string): Date | null {
  if (value.length !== MASKED_DATE_LENGTH) return null;

  const parsed = parse(value, DATE_FORMAT, new Date());
  if (!isValid(parsed)) return null;

  return parsed;
}

export function formatDate(date: Date): string {
  return format(date, DATE_FORMAT);
}
