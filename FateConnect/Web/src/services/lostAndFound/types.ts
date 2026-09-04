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
  type: LostItemKindEnum;
  place: string;
  occurredOn: string;
  description: string | null;
  photoUrl: string | null;
  status: LostItemStatusEnum;
  deletionReason: DeletionReasonEnum | null;
  isMine: boolean;
  createdAt: string;
};

/** A foto fica de fora: quem devolve a `photoUrl` é o servidor. */
export type LostItemInput = Pick<
  LostItem,
  'name' | 'type' | 'place' | 'occurredOn' | 'description'
>;

export interface LostItemFilter extends PageQuery {
  name?: string;
  occurredOn?: string;
  kind?: LostItemKindEnum;
  onlyMine?: boolean;
  status?: LostItemStatusEnum;
}
