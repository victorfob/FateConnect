import { format, isValid, parse } from 'date-fns';

const BIRTH_DATE_FORMAT = 'dd/MM/yyyy';
const API_DATE_FORMAT = 'yyyy-MM-dd';
const MINIMUM_AGE_YEARS = 18;
const EARLIEST_BIRTH_YEAR = 1900;
const JANUARY = 0;
const FIRST_DAY_OF_MONTH = 1;

/** Piso do seletor, igual ao do formulário anterior. */
export const EARLIEST_BIRTH_DATE = new Date(EARLIEST_BIRTH_YEAR, JANUARY, FIRST_DAY_OF_MONTH);

/**
 * Última data de nascimento aceita — quem completa 18 anos hoje ainda pode se
 * cadastrar. Calculada na validação, não no carregamento do módulo, para que a
 * aba aberta durante a virada do dia continue correta.
 */
export function latestBirthDate(reference: Date = new Date()): Date {
  const latest = new Date(reference);
  latest.setFullYear(latest.getFullYear() - MINIMUM_AGE_YEARS);

  return latest;
}

/** Converte `dd/mm/aaaa` em data, ou `null` quando o texto não é uma data real. */
export function parseBirthDate(value: string): Date | null {
  const parsed = parse(value, BIRTH_DATE_FORMAT, new Date());
  if (!isValid(parsed)) return null;

  return parsed;
}

export function formatBirthDate(date: Date): string {
  return format(date, BIRTH_DATE_FORMAT);
}

/**
 * Meia-noite em UTC montada a partir das partes da data. `toISOString()` sobre
 * a data local carrega o deslocamento do fuso — e a leste de Greenwich isso
 * muda o dia de nascimento.
 */
export function toApiBirthDate(date: Date): string {
  return `${format(date, API_DATE_FORMAT)}T00:00:00Z`;
}
