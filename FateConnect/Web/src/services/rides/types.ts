/** Valores canônicos alinhados à serialização do backend. */
export enum RideTypeEnum {
  PHILANTHROPIC = 'Filantropica',
  EGALITARIAN = 'Igualitaria',
}

/** Entidade como a API devolve (campos em pt-BR). O id é o `Guid` do backend. */
export type Ride = {
  id: string;
  qtdVagas: number;
  destino: string;
  dataPartida: string;
  horaPartida: string;
  dataCadastro: string;
  tipoCarona: RideTypeEnum;
  descricao: string | null;
  ativo: boolean;
};

/**
 * Corpo de criação e de atualização — a API aceita o mesmo conjunto de campos
 * nos dois verbos.
 */
export type RideInput = Omit<Ride, 'id' | 'dataCadastro' | 'ativo'>;

/** Filtros do front, em inglês; o serviço traduz para os parâmetros da API. */
export type RideFilter = {
  destination?: string;
  departureDate?: string;
  departureTime?: string;
  rideType?: RideTypeEnum;
};
