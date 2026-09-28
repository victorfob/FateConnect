import type { PageQuery, UserContact } from '../types';

/** Valores canônicos alinhados à serialização do backend. */
export enum RideTypeEnum {
  SOLIDARITY = 'Solidarity',
  EGALITARIAN = 'Egalitarian',
}

/** Como a carona se repete; `ONCE` é a carona de uma vez só, a de sempre. */
export enum RideFrequencyEnum {
  ONCE = 'Once',
  WEEKDAYS = 'Weekdays',
  WEEKLY = 'Weekly',
  MONTHLY = 'Monthly',
}

/** Faixas de partida que a API resolve; a noite atravessa a meia-noite. */
export enum RideShiftEnum {
  MORNING = 'Morning',
  AFTERNOON = 'Afternoon',
  NIGHT = 'Night',
}

/** Entidade como a API devolve. O id é o `Guid` do backend. */
export type Ride = {
  id: string;
  destination: string;
  /** A próxima partida; na carona de uma vez só, a única. */
  departureDate: string;
  departureTime: string;
  createdAt: string;
  rideType: RideTypeEnum;
  description: string | null;
  driver: UserContact;
  /**
   * Vem calculado pela API para quem perguntou. O front não teria como inferir:
   * o login guarda o nome, não o id de quem ofertou.
   */
  isOwner: boolean;
  frequency: RideFrequencyEnum;
  repeatUntil: string | null;
};

/**
 * Corpo de criação e de atualização — a API aceita o mesmo conjunto de campos
 * nos dois verbos. A data final só viaja com recorrência: a API a recusa na
 * carona de uma vez só.
 */
export interface RideInput extends Omit<
  Ride,
  'id' | 'createdAt' | 'driver' | 'isOwner' | 'repeatUntil'
> {
  repeatUntil?: string;
}

/** Filtros da listagem, com os mesmos nomes que a API recebe na query. */
export interface RideFilter extends PageQuery {
  searchTerm?: string;
  /** Uma ponta só filtra o dia inteiro dela; sem nenhuma, a data sai da consulta. */
  dateFrom?: string;
  dateTo?: string;
  departureShift?: RideShiftEnum;
  rideType?: RideTypeEnum;
  /** Só as que a pessoa ofertou; o id de quem pergunta viaja fora da query. */
  onlyMine?: boolean;
}
