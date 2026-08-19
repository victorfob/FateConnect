import { rideApiClient } from '../httpClient';
import type { Ride, RideFilter } from './types';

const RIDES_PATH = '/caronas';

/** Tradução dos filtros do front para os nomes de parâmetro da API. */
function toQueryParams(filters: RideFilter = {}): Record<string, string> {
  const params: Record<string, string> = {};

  if (filters.destination) params.Destino = filters.destination;
  if (filters.departureDate) params.DataPartida = filters.departureDate;
  if (filters.departureTime) params.HoraPartida = filters.departureTime;
  if (filters.rideType) params.TipoCarona = filters.rideType;

  return params;
}

export async function listRides(filters?: RideFilter): Promise<Ride[]> {
  const { data } = await rideApiClient.get<Ride[]>(RIDES_PATH, { params: toQueryParams(filters) });

  return data;
}

export async function deleteRide(rideId: number): Promise<void> {
  await rideApiClient.delete(`${RIDES_PATH}/${rideId}`);
}
