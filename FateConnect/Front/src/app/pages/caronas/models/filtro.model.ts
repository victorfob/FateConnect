import type { CaronaType } from './carona-type.model';

export interface FiltroCarona {
  data?: string;
  hora?: string;
  destino?: string;
  caronaType?: CaronaType;
}
