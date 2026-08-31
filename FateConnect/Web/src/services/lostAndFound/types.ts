import type { PageQuery } from '../types';

/** Valores canônicos alinhados à serialização do backend. */
export enum LostItemKindEnum {
  FOUND = 'Achado',
  LOST = 'Perdido',
}

export enum LostItemStatusEnum {
  OPEN = 'Aberto',
  RESOLVED = 'Resolvido',
  CANCELLED = 'Cancelado',
}

export enum CancellationReasonEnum {
  OWNER = 'Usuario',
  INACTIVITY = 'Inatividade',
}

export type LostItem = {
  id: string;
  nome: string;
  tipo: LostItemKindEnum;
  local: string;
  dataOcorrido: string;
  descricao: string | null;
  fotoUrl: string | null;
  situacao: LostItemStatusEnum;
  motivoCancelamento: CancellationReasonEnum | null;
  meuItem: boolean;
  dataCadastro: string;
};

/** A foto fica de fora: quem devolve a `fotoUrl` é o servidor. */
export type LostItemInput = Pick<
  LostItem,
  'nome' | 'tipo' | 'local' | 'dataOcorrido' | 'descricao'
>;

export interface LostItemFilter extends PageQuery {
  name?: string;
  occurredOn?: string;
  kind?: LostItemKindEnum;
  onlyMine?: boolean;
  status?: LostItemStatusEnum;
}
