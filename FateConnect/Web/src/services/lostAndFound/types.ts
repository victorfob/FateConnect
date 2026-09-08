import type { PageQuery } from '../types';

/** Valores canônicos alinhados à serialização do backend. */
export enum LostItemKindEnum {
  FOUND = 'Found',
  LOST = 'Lost',
}

export enum LostItemStatusEnum {
  OPEN = 'Open',
  RESOLVED = 'Resolved',
  DELETED = 'Deleted',
}

export enum DeletionReasonEnum {
  USER = 'User',
  INACTIVITY = 'Inactivity',
}

export type LostItem = {
  id: string;
  name: string;
  lostAndFoundType: LostItemKindEnum;
  place: string;
  ocurredOn: string;
  description: string | null;
  imageUrl: string | null;
  status: LostItemStatusEnum;
  deletionReason: DeletionReasonEnum | null;
  isOwner: boolean;
  createdAt: string;
};

/** A foto fica de fora: quem devolve a `imageUrl` é o servidor. */
export type LostItemInput = Pick<
  LostItem,
  'name' | 'lostAndFoundType' | 'place' | 'ocurredOn' | 'description'
>;

export interface LostItemFilter extends PageQuery {
  name?: string;
  occurredOn?: string;
  kind?: LostItemKindEnum;
  onlyMine?: boolean;
  status?: LostItemStatusEnum;
}
