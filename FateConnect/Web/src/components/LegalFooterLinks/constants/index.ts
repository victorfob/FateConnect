import { PRIVACY_URL, TERMS_URL } from '@app/constants/legalDocuments';

export const LEGAL_FOOTER_LINKS: readonly { label: string; url: string }[] = [
  { label: 'Termos de uso', url: TERMS_URL },
  { label: 'Política de privacidade', url: PRIVACY_URL },
];
