/** Valores canônicos alinhados à serialização do backend. */
export enum RideTypeEnum {
  PHILANTHROPIC = 'Filantropica',
  EGALITARIAN = 'Igualitaria',
}

/** Entidade como a API devolve (campos em pt-BR). */
export type Ride = {
  id: number;
  qtdVagas: number;
  destino: string;
  dataPartida: string;
  horaPartida: string;
  dataCadastro: string;
  tipoCarona: RideTypeEnum;
  descricao: string;
  ativo: boolean;
};

/** Filtros do front, em inglês; o serviço traduz para os parâmetros da API. */
export type RideFilter = {
  destination?: string;
  departureDate?: string;
  departureTime?: string;
  rideType?: RideTypeEnum;
};
