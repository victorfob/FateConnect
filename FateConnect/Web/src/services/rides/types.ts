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

/** Filtros do front, em inglês; o serviço traduz para os parâmetros da API. */
export type RideFilter = {
  destination?: string;
  departureDate?: string;
  departureTime?: string;
  rideType?: RideTypeEnum;
};
