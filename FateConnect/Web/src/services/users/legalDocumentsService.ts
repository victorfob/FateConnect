import { apiClient } from '../httpClient';
import type { DocumentAcceptance } from '../signup/types';
import type { LegalDocumentStatus } from './legalDocumentsTypes';

const LEGAL_DOCUMENTS_PATH = '/users/me/legal-documents';

export async function getLegalDocuments(): Promise<LegalDocumentStatus[]> {
  const { data } = await apiClient.get<LegalDocumentStatus[]>(LEGAL_DOCUMENTS_PATH);

  return data;
}

export async function acceptLegalDocuments(acceptances: DocumentAcceptance[]): Promise<void> {
  await apiClient.post(`${LEGAL_DOCUMENTS_PATH}/acceptances`, { acceptances });
}
