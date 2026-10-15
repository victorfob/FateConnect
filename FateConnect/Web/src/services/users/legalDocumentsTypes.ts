import type { DocumentTypeEnum } from '../signup/types';

export type LegalDocumentStatus = {
  document: DocumentTypeEnum;
  currentVersion: string;
  acceptedCurrentVersion: boolean;
};
