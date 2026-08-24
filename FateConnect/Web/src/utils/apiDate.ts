import { format, isValid, parseISO } from 'date-fns';

/** A API troca data em `aaaa-mm-dd`, no fuso local. */
const API_DATE_FORMAT = 'yyyy-MM-dd';

export function toApiDate(date: Date): string {
  return format(date, API_DATE_FORMAT);
}

/**
 * Data do seletor para o texto que o formulário guarda. Enquanto se digita, o
 * seletor entrega `Invalid Date` — formatar isso lança, então vira campo vazio.
 */
export function toFormDate(date: Date | null): string {
  if (!date || !isValid(date)) return '';

  return toApiDate(date);
}

/** Caminho inverso: o texto guardado volta a ser `Date` para o seletor. */
export function fromFormDate(value: string): Date | null {
  if (!value) return null;

  const parsed = parseISO(value);
  if (!isValid(parsed)) return null;

  return parsed;
}
