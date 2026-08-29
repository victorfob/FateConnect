/** Valores canônicos alinhados à serialização do backend. */
export enum RideTypeEnum {
  SOLIDARITY = 'Solidarity',
  EGALITARIAN = 'Egalitarian',
}

/** Quem ofertou a carona, com o que o cartão precisa para chamar a pessoa. */
export type RideDriver = { name: string; email: string; phone: string };

/** Entidade como a API devolve. O id é o `Guid` do backend. */
export type Ride = {
  id: string;
  availableSeats: number;
  destination: string;
  departureDate: string;
  departureTime: string;
  createdAt: string;
  rideType: RideTypeEnum;
  description: string | null;
  driver: RideDriver;
  /**
   * Vem calculado pela API para quem perguntou. O front não teria como inferir:
   * o login guarda o nome, não o id de quem ofertou.
   */
  isOwner: boolean;
};

/**
 * Corpo de criação e de atualização — a API aceita o mesmo conjunto de campos
 * nos dois verbos.
 */
export type RideInput = Omit<Ride, 'id' | 'createdAt' | 'driver' | 'isOwner'>;

/** Filtros da listagem, com os mesmos nomes que a API recebe na query. */
export type RideFilter = {
  destination?: string;
  departureDate?: string;
  departureTime?: string;
  rideType?: RideTypeEnum;
};
