/**
 * Versão de cada documento, no formato da API. É ela que o cadastro envia para
 * registrar **qual texto** a pessoa aceitou — mudar o documento sem mudar a data
 * aqui deixa o aceite apontando para um texto que não existe mais.
 */
export const TERMS_VERSION = '2026-08-27';
export const PRIVACY_VERSION = '2026-08-27';

/** Arquivos servidos de `public/`, gerados por `legal/build-pdfs.sh`. */
export const TERMS_URL = '/termos.pdf';
export const PRIVACY_URL = '/privacidade.pdf';
