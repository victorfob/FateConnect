import { PRIVACY_VERSION, TERMS_VERSION } from '@app/constants/legalDocuments';
import {
  DocumentTypeEnum,
  type DocumentAcceptance,
  type SignupRequest,
} from '@app/services/signup/types';
import { toApiDateText } from '@app/utils/apiDate';

import type { SignupFormValues } from '../schema';

/**
 * ⛔ A versão sai das constantes dos documentos, nunca da data de hoje: o
 * registro precisa apontar para o texto que a pessoa leu ao aceitar.
 */
function acceptedDocuments(): DocumentAcceptance[] {
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
    birthDate: toApiDateText(values.birthDate),
    acceptances: acceptedDocuments(),
    receiveNotifications: values.acceptNotifications,
  };
}
