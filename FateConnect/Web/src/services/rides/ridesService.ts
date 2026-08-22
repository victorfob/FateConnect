import { rideApiClient } from '../httpClient';
import type { Ride, RideFilter } from './types';

const RIDES_PATH = '/caronas';

const INVALID_LIST_PAYLOAD_MESSAGE = 'A API de caronas respondeu algo que não é uma lista.';

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

  // O tipo do axios é uma promessa de contrato, não uma garantia: sem o endereço
  // da API a requisição cai no próprio servidor de desenvolvimento, que responde
  // o HTML da aplicação com status 200. Falhar aqui transforma isso na
  // notificação de erro da tela, em vez de estourar depois ao percorrer a lista.
  if (!Array.isArray(data)) throw new Error(INVALID_LIST_PAYLOAD_MESSAGE);

  return data;
}

export async function deleteRide(rideId: string): Promise<void> {
  await rideApiClient.delete(`${RIDES_PATH}/${rideId}`);
}
