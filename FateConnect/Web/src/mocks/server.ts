import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { PRIVACY_VERSION, TERMS_VERSION } from '@app/constants/legalDocuments';
import { loggedUserName } from '@app/services/auth/loggedUser';
import { DocumentTypeEnum } from '@app/services/signup/types';
import { PROFILE } from '@app/test/profile';

const NO_CONTENT = 204;
const NO_UNREAD = 0;

const defaultHandlers = [
  http.get(
    'https://api.fateconnect.test/auth/session',
    () => new HttpResponse(null, { status: NO_CONTENT }),
  ),
  // O menu da conta pede o perfil em toda tela logada; o nome é o do token do teste.
  http.get('https://api.fateconnect.test/users/me', () =>
    HttpResponse.json({ ...PROFILE, fullName: loggedUserName() ?? PROFILE.fullName }),
  ),
  // Toda tela logada confere o aceite dos documentos; o padrão é quem já aceitou a versão vigente.
  http.get('https://api.fateconnect.test/users/me/legal-documents', () =>
    HttpResponse.json([
      {
        document: DocumentTypeEnum.TERMS_OF_USE,
        currentVersion: TERMS_VERSION,
        acceptedCurrentVersion: true,
      },
      {
        document: DocumentTypeEnum.PRIVACY_POLICY,
        currentVersion: PRIVACY_VERSION,
        acceptedCurrentVersion: true,
      },
    ]),
  ),
  // A campainha lê o contador e abre a conexão do hub em toda tela logada. Sem
  // servidor de hub no teste, a conexão falha e fica tentando em silêncio.
  http.get('https://api.fateconnect.test/inappnotifications/unread-count', () =>
    HttpResponse.json(NO_UNREAD),
  ),
  http.post('https://api.fateconnect.test/hubs/notifications/negotiate', () =>
    HttpResponse.error(),
  ),
];

/** Servidor de mocks compartilhado. Cada teste registra os handlers de que precisa. */
export const server = setupServer(...defaultHandlers);
