import { PRIVACY_URL, TERMS_URL } from '@app/constants/legalDocuments';

export const LEGAL_DOCUMENTS_TITLE = 'Documentos atualizados';

export const TERMS_LINK = { label: 'Termos de uso', url: TERMS_URL };
export const PRIVACY_LINK = { label: 'Política de privacidade', url: PRIVACY_URL };

export const CHANGED_MESSAGES = {
  termsOfUse: { prefix: 'Os ', suffix: ' mudaram. Para continuar, leia e aceite a nova versão.' },
  privacyPolicy: { prefix: 'A ', suffix: ' mudou. Para continuar, leia e aceite a nova versão.' },
  both: {
    prefix: 'Os ',
    separator: ' e a ',
    suffix: ' mudaram. Para continuar, leia e aceite as novas versões.',
  },
};

/** Fecha a mesma frase: o link no fim abre a confirmação de desativar, a mesma de Meu perfil. */
export const DISAGREEMENT = {
  prefix: ' Se não concordar, você pode sair ou ',
  deactivateLink: 'desativar a conta',
  suffix: '.',
};

export const SIGN_OUT_LABEL = 'Sair';
export const ACCEPT_LABEL = 'Aceitar';

export const ACCEPT_FAILED = 'Erro ao registrar o aceite. Tente novamente.';
