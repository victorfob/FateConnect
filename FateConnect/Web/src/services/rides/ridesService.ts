import { apiClient } from '../httpClient';
import type { Ride, RideFilter, RideInput } from './types';

const RIDES_PATH = '/Rides';

const INVALID_LIST_PAYLOAD_MESSAGE = 'A API de caronas respondeu algo que não é uma lista.';

export async function listRides(filters?: RideFilter): Promise<Ride[]> {
  const { data } = await apiClient.get<Ride[]>(RIDES_PATH, { params: filters });

  // O tipo do axios é uma promessa de contrato, não uma garantia: sem o endereço
  // da API a requisição cai no próprio servidor de desenvolvimento, que responde
  // o HTML da aplicação com status 200. Falhar aqui transforma isso na
  // notificação de erro da tela, em vez de estourar depois ao percorrer a lista.
  if (!Array.isArray(data)) throw new Error(INVALID_LIST_PAYLOAD_MESSAGE);

  return data;
}

export async function createRide(input: RideInput): Promise<Ride> {
  const { data } = await apiClient.post<Ride>(RIDES_PATH, input);

  return data;
}

export async function updateRide(rideId: string, input: RideInput): Promise<Ride> {
  const { data } = await apiClient.put<Ride>(`${RIDES_PATH}/${rideId}`, input);

  return data;
}

export async function deleteRide(rideId: string): Promise<void> {
  await apiClient.delete(`${RIDES_PATH}/${rideId}`);
}
