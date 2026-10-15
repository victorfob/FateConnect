import { http, HttpResponse } from 'msw';

import { server } from '@app/mocks/server';

import { DocumentTypeEnum } from '../signup/types';
import { acceptLegalDocuments, getLegalDocuments } from './legalDocumentsService';
import type { LegalDocumentStatus } from './legalDocumentsTypes';

const LEGAL_DOCUMENTS_URL = 'https://api.fateconnect.test/users/me/legal-documents';
const ACCEPTANCES_URL = `${LEGAL_DOCUMENTS_URL}/acceptances`;

const NO_CONTENT = 204;

const DOCUMENTS: LegalDocumentStatus[] = [
  {
    document: DocumentTypeEnum.TERMS_OF_USE,
    currentVersion: '2026-10-14',
    acceptedCurrentVersion: true,
  },
  {
    document: DocumentTypeEnum.PRIVACY_POLICY,
    currentVersion: '2026-12-01',
    acceptedCurrentVersion: false,
  },
];

describe('legalDocumentsService', () => {
  it('should read the documents of whoever is logged in', async () => {
    server.use(http.get(LEGAL_DOCUMENTS_URL, () => HttpResponse.json(DOCUMENTS)));

    await expect(getLegalDocuments()).resolves.toEqual(DOCUMENTS);
  });

  it('should send the accepted documents with their versions', async () => {
    let body: unknown = null;
    server.use(
      http.post(ACCEPTANCES_URL, async ({ request }) => {
        body = await request.json();

        return new HttpResponse(null, { status: NO_CONTENT });
      }),
    );

    await acceptLegalDocuments([
      { document: DocumentTypeEnum.PRIVACY_POLICY, version: '2026-12-01' },
    ]);

    expect(body).toEqual({
      acceptances: [{ document: DocumentTypeEnum.PRIVACY_POLICY, version: '2026-12-01' }],
    });
  });
});
