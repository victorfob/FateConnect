import { onlyDigits } from '@design-system';

import { PRIVACY_VERSION, TERMS_VERSION } from '@app/constants/legalDocuments';
import {
  DocumentTypeEnum,
  type SignupAcceptance,
  type SignupRequest,
} from '@app/services/signup/types';

import type { SignupFormValues } from '../schema';
import { parseBirthDate, toApiBirthDate } from './birthDate';

/** O schema já garantiu a data; o vazio só existe para o tipo fechar. */
function toApiBirthDateOrEmpty(value: string): string {
  const parsed = parseBirthDate(value);
  if (!parsed) return '';

  return toApiBirthDate(parsed);
}

/**
 * ⛔ A versão sai das constantes dos documentos, nunca da data de hoje: o
 * registro precisa apontar para o texto que a pessoa leu ao aceitar.
 */
function acceptedDocuments(): SignupAcceptance[] {
  return [
    { document: DocumentTypeEnum.TERMS_OF_USE, version: TERMS_VERSION },
    { document: DocumentTypeEnum.PRIVACY_POLICY, version: PRIVACY_VERSION },
  ];
}

export function toSignupRequest(values: SignupFormValues): SignupRequest {
  return {
    fullName: values.fullName,
    fatecEmail: values.fatecEmail,
    password: values.password,
    birthDate: toApiBirthDateOrEmpty(values.birthDate),
    gender: values.gender,
    phone: onlyDigits(values.phone),
    contactEmail: values.contactEmail,
    acceptances: acceptedDocuments(),
    // Uma caixa só decide as duas: a tela de preferências as separa depois.
    receiveEmails: values.acceptMarketing,
    receiveNotifications: values.acceptMarketing,
  };
}
