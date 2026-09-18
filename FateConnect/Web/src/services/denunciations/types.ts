import type { PageQuery, UserContact } from '../types';

/** Valores canônicos alinhados à serialização do backend. */
export enum DenunciationCategoryEnum {
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

export enum DenunciationStatusEnum {
  OPEN = 'Open',
  IN_REVIEW = 'InReview',
  RESOLVED = 'Resolved',
  DISMISSED = 'Dismissed',
}

export type Denunciation = {
  id: string;
  category: DenunciationCategoryEnum;
  description: string;
  /** Sempre nulo para quem denuncia: a API só entrega a foto a quem analisa. */
  imageUrl: string | null;
  hasImage: boolean;
  status: DenunciationStatusEnum;
  /** Nulo quando a denúncia esconde de quem analisa o contato de quem a fez. */
  user: UserContact | null;
  isAnonymous: boolean;
  createdAt: string;
};

/**
 * Sem campo de autoria: a API recorta pelo perfil do token, e quem não é
 * administrador só recebe as próprias.
 */
export interface DenunciationFilter extends PageQuery {
  status?: DenunciationStatusEnum;
  category?: DenunciationCategoryEnum;
  searchTerm?: string;
  /** Uma ponta só filtra o dia inteiro dela; sem nenhuma, a data sai da consulta. */
  dateFrom?: string;
  dateTo?: string;
}

export type DenunciationInput = {
  category: DenunciationCategoryEnum;
  description: string;
  isAnonymous: boolean;
  image: File | null;
};
