import { format, isValid, parse, parseISO } from 'date-fns';

/** A API troca data em `aaaa-mm-dd`, no fuso local. */
const API_DATE_FORMAT = 'yyyy-MM-dd';
/** O campo mostra e recebe `dd/mm/aaaa`. */
const DISPLAY_DATE_FORMAT = 'dd/MM/yyyy';
/** Hífen espaçado: é como o campo de período escreve o intervalo. */
const RANGE_SEPARATOR = ' - ';

/** As duas pontas do período como a API as recebe; ponta ausente vem vazia. */
export type ApiDateRange = { dateFrom: string; dateTo: string };

export function toApiDate(date: Date): string {
  return format(date, API_DATE_FORMAT);
}

/**
 * Texto do campo para o que a API e o endereço guardam. Texto incompleto vira
 * vazio: `22/0` não é data, e a consulta não deve inventar uma.
 */
export function toApiDateText(displayed: string): string {
  if (!displayed) return '';

  const parsed = parse(displayed, DISPLAY_DATE_FORMAT, new Date());
  if (!isValid(parsed)) return '';

  return toApiDate(parsed);
}

/** Caminho inverso: o que estava guardado volta para o campo. */
export function toDisplayDate(stored: string): string {
  if (!stored) return '';

  const parsed = parseISO(stored);
  if (!isValid(parsed)) return '';

  return format(parsed, DISPLAY_DATE_FORMAT);
}

/**
 * O texto do campo de período para as duas pontas da consulta. Fim anterior ao
 * início não fecha intervalo, então só o início viaja — é o que o próprio campo
 * faz ao ler o que foi digitado, e a API trata uma ponta só como o dia inteiro.
 */
export function toApiDateRange(masked: string): ApiDateRange {
  const [startText = '', endText = ''] = masked.split(RANGE_SEPARATOR);

  const dateFrom = toApiDateText(startText);
  const dateTo = toApiDateText(endText);

  if (dateTo && dateTo < dateFrom) return { dateFrom, dateTo: '' };

  return { dateFrom, dateTo };
}

/** Caminho inverso: o período guardado volta para o texto do campo. */
export function toDisplayDateRange(dateFrom = '', dateTo = ''): string {
  const startText = toDisplayDate(dateFrom);
  const endText = toDisplayDate(dateTo);

  if (!startText || !endText) return startText || endText;

  return `${startText}${RANGE_SEPARATOR}${endText}`;
}
