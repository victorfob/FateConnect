import { onlyDigits } from '@design-system';

/**
 * Código do Brasil. Os telefones do produto vêm com DDD e sem código de país, e
 * tanto o `wa.me` quanto o `tel:` só entendem o número em formato internacional.
 */
const COUNTRY_CODE = '55';

export function internationalPhoneDigits(phone: string): string {
  return `${COUNTRY_CODE}${onlyDigits(phone)}`;
}
