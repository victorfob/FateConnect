import { isBefore, startOfDay } from 'date-fns';

import {
  formatDate,
  maskDate,
  parseDate,
} from '@ds-root/components/Input/components/DateField/helpers';
import { onlyDigits } from '@ds-root/utils/text';

import { RANGE_SEPARATOR } from '../constants';
import type { PartialDateRange } from '../types';

const TEXT_START = 0;
const MAX_RANGE_DIGITS = 16;
const START_DIGITS = 8;

export function isDayBefore(candidate: Date, reference: Date): boolean {
  return isBefore(startOfDay(candidate), startOfDay(reference));
}

/** Formata `dd/mm/aaaa - dd/mm/aaaa` progressivamente, sobre a máscara de uma data. */
export function maskDateRange(value: string): string {
  const digits = onlyDigits(value).slice(TEXT_START, MAX_RANGE_DIGITS);
  const endDigits = digits.slice(START_DIGITS);

  if (!endDigits) return maskDate(digits);

  return `${maskDate(digits)}${RANGE_SEPARATOR}${maskDate(endDigits)}`;
}

export function formatDateRange(start: Date, end: Date): string {
  return `${formatDate(start)}${RANGE_SEPARATOR}${formatDate(end)}`;
}

/**
 * O que o calendário consegue mostrar do que já foi digitado: o início sozinho
 * enquanto o fim não fecha intervalo, e os dois quando fecha. Fim anterior ao
 * início não fecha nada, então o campo continua esperando um fim.
 */
export function parseRangeSoFar(value: string): PartialDateRange {
  const [startText = '', endText = ''] = value.split(RANGE_SEPARATOR);

  const start = parseDate(startText);
  if (!start) return { start: null, end: null };

  const end = parseDate(endText);
  if (!end || isDayBefore(end, start)) return { start, end: null };

  return { start, end };
}
