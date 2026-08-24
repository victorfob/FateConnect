/** Valores canônicos alinhados à serialização do backend. */
export enum LostItemKindEnum {
  FOUND = 'Achado',
  LOST = 'Perdido',
}

/** `Concluido` viaja sem acento, como o backend serializa. */
export enum LostItemStatusEnum {
  OPEN = 'Aberto',
  RESOLVED = 'Concluido',
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

export type LostItemFilter = {
  name?: string;
  occurredOn?: string;
  kind?: LostItemKindEnum;
  onlyMine?: boolean;
  status?: LostItemStatusEnum;
};
