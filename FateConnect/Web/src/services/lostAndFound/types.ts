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

export type LostItemInput = Pick<LostItem, 'name' | 'lostAndFoundType' | 'place' | 'ocurredOn'> & {
  /** String vazia limpa a descrição guardada; omitir o campo a deixaria como está. */
  description: string;
  image: File | null;
};

/** Filtros da listagem, com os mesmos nomes que a API recebe na query. */
export interface LostItemFilter extends PageQuery {
  searchTerm?: string;
  ocurredOn?: string;
  lostAndFoundType?: LostItemKindEnum;
  onlyMyItems?: boolean;
  status?: LostItemStatusEnum;
}
