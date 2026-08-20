import { onlyDigits } from './caret';

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
    return `${subscriber.slice(0, MOBILE_PREFIX_LENGTH)}-${subscriber.slice(MOBILE_PREFIX_LENGTH)}`;
  }

  return `${subscriber.slice(0, LANDLINE_PREFIX_LENGTH)}-${subscriber.slice(LANDLINE_PREFIX_LENGTH)}`;
}

/** Formata `(00) 0000-0000` ou `(00) 00000-0000`, conforme o comprimento. */
export function maskPhone(value: string): string {
  const digits = onlyDigits(value).slice(0, MAX_PHONE_DIGITS);

  if (digits.length === 0) return '';
  if (digits.length <= AREA_CODE_LENGTH) return `(${digits}`;

  return `(${digits.slice(0, AREA_CODE_LENGTH)}) ${maskSubscriber(digits.slice(AREA_CODE_LENGTH))}`;
}
