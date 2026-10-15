import legalDocumentVersions from '@legal/versions.json';

/**
 * Versão de cada documento, no formato da API, lida do arquivo que a API também
 * embute. Mudar o documento sem mudar a data ali deixa o aceite apontando para um
 * texto que não existe mais.
 */
export const TERMS_VERSION: string = legalDocumentVersions.termsOfUse;
export const PRIVACY_VERSION: string = legalDocumentVersions.privacyPolicy;

/** Arquivos servidos de `public/`, gerados por `legal/build-pdfs.sh`. */
export const TERMS_URL = '/termos.pdf';
export const PRIVACY_URL = '/privacidade.pdf';
