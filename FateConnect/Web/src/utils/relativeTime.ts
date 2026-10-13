import { differenceInHours, differenceInMinutes, format, isSameDay, subDays } from 'date-fns';

const DATE_FORMAT = 'dd/MM/yyyy';
const MINUTES_IN_AN_HOUR = 60;
const HOURS_IN_A_DAY = 24;
const ONE = 1;
const PREVIOUS_DAY = 1;

const JUST_NOW = 'agora';
const YESTERDAY = 'ontem';

function ago(amount: number, singular: string, plural: string): string {
  if (amount === ONE) return `há ${amount} ${singular}`;

  return `há ${amount} ${plural}`;
}

export function relativeTime(date: Date, now: Date = new Date()): string {
  const minutes = differenceInMinutes(now, date);
  if (minutes < ONE) return JUST_NOW;
  if (minutes < MINUTES_IN_AN_HOUR) return ago(minutes, 'minuto', 'minutos');

  const hours = differenceInHours(now, date);
  if (hours < HOURS_IN_A_DAY) return ago(hours, 'hora', 'horas');

  if (isSameDay(date, subDays(now, PREVIOUS_DAY))) return YESTERDAY;

  return format(date, DATE_FORMAT);
}
