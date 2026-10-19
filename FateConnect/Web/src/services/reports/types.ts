import type { PageQuery, UserContact } from '../types';

/** Valores canônicos alinhados à serialização do backend. */
export enum ReportCategoryEnum {
  INAPPROPRIATE_BEHAVIOR = 'InappropriateBehavior',
  FAKE_PROFILE = 'FakeProfile',
  SPAM = 'Spam',
  RECKLESS_DRIVING = 'RecklessDriving',
  NO_SHOW = 'NoShow',
  IMPROPER_CHARGING = 'ImproperCharging',
  FRAUDULENT_CLAIM = 'FraudulentClaim',
  FAKE_ITEM_POSTING = 'FakeItemPosting',
  OTHER = 'Other',
}

export enum ReportStatusEnum {
  OPEN = 'Open',
  IN_REVIEW = 'InReview',
  RESOLVED = 'Resolved',
  DISMISSED = 'Dismissed',
}

export type Report = {
  id: string;
  category: ReportCategoryEnum;
  description: string;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  status: ReportStatusEnum;
  /** Nulo quando a denúncia esconde de quem analisa o contato de quem a fez. */
  user: UserContact | null;
  isConfidential: boolean;
  createdAt: string;
};

/**
 * Sem campo de autoria: a API recorta pelo perfil do token, e quem não é
 * administrador só recebe as próprias.
 */
export interface ReportFilter extends PageQuery {
  status?: ReportStatusEnum;
  category?: ReportCategoryEnum;
  searchTerm?: string;
  /** Uma ponta só filtra o dia inteiro dela; sem nenhuma, a data sai da consulta. */
  dateFrom?: string;
  dateTo?: string;
}

export type ReportInput = {
  category: ReportCategoryEnum;
  description: string;
  isConfidential: boolean;
  image: File | null;
};
