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

/** Entidade como a API devolve (campos em pt-BR). O id é o `Guid` do backend. */
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

/**
 * Corpo de criação e de atualização — a API aceita o mesmo conjunto de campos
 * nos dois verbos. A foto fica de fora: quem devolve a `fotoUrl` é o servidor,
 * e o arquivo escolhido ainda não tem para onde subir.
 */
export type LostItemInput = Pick<
  LostItem,
  'nome' | 'tipo' | 'local' | 'dataOcorrido' | 'descricao'
>;

/** Filtros do front, em inglês; o serviço traduz para os parâmetros da API. */
export type LostItemFilter = {
  name?: string;
  occurredOn?: string;
  kind?: LostItemKindEnum;
  onlyMine?: boolean;
  status?: LostItemStatusEnum;
};
