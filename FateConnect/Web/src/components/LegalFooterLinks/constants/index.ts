import { PRIVACY_LABEL, PRIVACY_URL, TERMS_LABEL, TERMS_URL } from '@app/constants/legalDocuments';

export const LEGAL_FOOTER_LINKS: readonly { label: string; url: string }[] = [
  { label: TERMS_LABEL, url: TERMS_URL },
  { label: PRIVACY_LABEL, url: PRIVACY_URL },
];
