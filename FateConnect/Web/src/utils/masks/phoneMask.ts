import { onlyDigits } from '@design-system';

import { firstCharacters } from '../sequence';

const MAX_PHONE_DIGITS = 11;
const AREA_CODE_LENGTH = 2;
/** Assinante de telefone fixo tem 8 dígitos; o de celular, 9. */
const LANDLINE_SUBSCRIBER_LENGTH = 8;
const LANDLINE_PREFIX_LENGTH = 4;
const MOBILE_PREFIX_LENGTH = 5;

function maskSubscriber(subscriber: string): string {
  if (subscriber.length <= LANDLINE_PREFIX_LENGTH) return subscriber;

  // O traço muda de lugar quando o número passa a ter cara de celular.
  if (subscriber.length > LANDLINE_SUBSCRIBER_LENGTH) {
    return `${firstCharacters(subscriber, MOBILE_PREFIX_LENGTH)}-${subscriber.slice(MOBILE_PREFIX_LENGTH)}`;
  }

  return `${firstCharacters(subscriber, LANDLINE_PREFIX_LENGTH)}-${subscriber.slice(LANDLINE_PREFIX_LENGTH)}`;
}

/** Formata `(00) 0000-0000` ou `(00) 00000-0000`, conforme o comprimento. */
export function maskPhone(value: string): string {
  const digits = firstCharacters(onlyDigits(value), MAX_PHONE_DIGITS);

  if (digits === '') return '';
  if (digits.length <= AREA_CODE_LENGTH) return `(${digits}`;

  return `(${firstCharacters(digits, AREA_CODE_LENGTH)}) ${maskSubscriber(digits.slice(AREA_CODE_LENGTH))}`;
}
