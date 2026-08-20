import { format } from 'date-fns';

/** A API espera a data em `aaaa-mm-dd`, no fuso local. */
const API_DATE_FORMAT = 'yyyy-MM-dd';

export function toApiDate(date: Date): string {
  return format(date, API_DATE_FORMAT);
}
