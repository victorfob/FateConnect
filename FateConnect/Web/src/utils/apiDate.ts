import { format, isValid, parse, parseISO } from 'date-fns';

/** A API troca data em `aaaa-mm-dd`, no fuso local. */
const API_DATE_FORMAT = 'yyyy-MM-dd';
/** O campo mostra e recebe `dd/mm/aaaa`. */
const DISPLAY_DATE_FORMAT = 'dd/MM/yyyy';

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
