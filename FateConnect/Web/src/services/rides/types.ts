/** Valores canônicos alinhados à serialização do backend. */
export enum RideType {
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
  tipoCarona: RideType;
  descricao: string;
  ativo: boolean;
};

/** Filtros do front, em inglês; o serviço traduz para os parâmetros da API. */
export type RideFilter = {
  destination?: string;
  departureDate?: string;
  departureTime?: string;
  rideType?: RideType;
};
