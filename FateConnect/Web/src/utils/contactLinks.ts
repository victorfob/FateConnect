import { internationalPhoneDigits } from './phone';

export function mailtoUrl(email: string): string {
  return `mailto:${email}`;
}

export function telUrl(phone: string): string {
  return `tel:+${internationalPhoneDigits(phone)}`;
}
