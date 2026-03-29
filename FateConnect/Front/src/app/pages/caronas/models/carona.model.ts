import type { CaronaType } from './carona-type.model';

export interface Carona {
  id: number;
  qtdVagas: number;
  destino: string;
  dataPartida: string;
  horaPartida: string;
  dataCadastro: string;
  tipoCarona: CaronaType;
  descricao: string;
  ativo: boolean;
}
