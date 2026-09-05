import type { DateOrTimeView } from '@mui/x-date-pickers/models';
import { format, isValid, parse } from 'date-fns';

import { MASKED_DATE_LENGTH } from '@ds-root/components/Input/components/DateField/constants';
import { maskDate, parseDate } from '@ds-root/components/Input/components/DateField/helpers';
import { onlyDigits } from '@ds-root/utils/text';

import { MASKED_DATE_TIME_LENGTH, PICKER_VIEWS } from '../constants';

const DATE_TIME_FORMAT = 'dd/MM/yyyy HH:mm';
const TEXT_START = 0;
const MAX_DATE_TIME_DIGITS = 12;
const DATE_DIGITS = 8;
const HOUR_END = 2;

/** Formata `dd/mm/aaaa hh:mm` progressivamente, sobre a máscara só de data. */
export function maskDateTime(value: string): string {
  const digits = onlyDigits(value).slice(TEXT_START, MAX_DATE_TIME_DIGITS);
  const date = maskDate(digits);
  const time = digits.slice(DATE_DIGITS);

  if (!time) return date;
  if (time.length <= HOUR_END) return `${date} ${time}`;

  return `${date} ${time.slice(TEXT_START, HOUR_END)}:${time.slice(HOUR_END)}`;
}

/**
 * Converte `dd/mm/aaaa hh:mm` em data, ou `null` quando o texto não fecha uma.
 * Texto incompleto é `null` de propósito, como no campo só de data.
 */
export function parseDateTime(value: string): Date | null {
  if (value.length !== MASKED_DATE_TIME_LENGTH) return null;

  const parsed = parse(value, DATE_TIME_FORMAT, new Date());
  if (!isValid(parsed)) return null;

  return parsed;
}

export function formatDateTime(date: Date): string {
  return format(date, DATE_TIME_FORMAT);
}

/**
 * O que o calendário e o relógio conseguem mostrar do que já foi digitado: o
 * dia e a hora quando os dois fecham, e só o dia enquanto a hora não chega.
 */
export function parseDateTimeSoFar(value: string): Date | null {
  return parseDateTime(value) ?? parseDate(value.slice(TEXT_START, MASKED_DATE_LENGTH));
}

const PICKER_VIEW_NAMES: ReadonlySet<string> = new Set<string>(PICKER_VIEWS);

/**
 * O seletor avisa a troca de passo com o vocabulário dele, que inclui o `am/pm`
 * de um relógio de 12 horas — que em pt-BR não existe.
 */
export function isPickerView(view: string): view is DateOrTimeView {
  return PICKER_VIEW_NAMES.has(view);
}
