import { PRIVACY_LABEL, TERMS_LABEL } from '@app/constants/legalDocuments';

export const CONSENT_TERMS_PREFIX = 'Eu concordo com os';
export const CONSENT_TERMS_SEPARATOR = 'e';

export const CONSENT_TERMS_FIELD_ID = 'accept-terms';

/** Nome acessível da caixa: a frase inteira, já que o rótulo visível não a envolve. */
export const CONSENT_TERMS_ARIA_LABEL = `${CONSENT_TERMS_PREFIX} ${TERMS_LABEL} ${CONSENT_TERMS_SEPARATOR} ${PRIVACY_LABEL}`;
export const CONSENT_NOTIFICATIONS_LABEL = 'Eu concordo em receber notificações do aplicativo';
