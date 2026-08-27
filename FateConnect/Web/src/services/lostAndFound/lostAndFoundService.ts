import { apiClient } from '../httpClient';
import {
  LostItemStatusEnum,
  type LostItem,
  type LostItemFilter,
  type LostItemInput,
} from './types';

const LOST_AND_FOUND_PATH = '/achado';

const INVALID_LIST_PAYLOAD_MESSAGE =
  'A API de achados e perdidos respondeu algo que não é uma lista.';

function toQueryParams(filters: LostItemFilter = {}): Record<string, string> {
  const params: Record<string, string> = {};

  if (filters.name) params.Nome = filters.name;
  if (filters.occurredOn) params.DataOcorrido = filters.occurredOn;
  if (filters.kind) params.Tipo = filters.kind;
  if (filters.onlyMine) params.MeusItens = 'true';
  if (filters.status) params.Situacao = filters.status;

  return params;
}

export async function listLostItems(filters?: LostItemFilter): Promise<LostItem[]> {
  const { data } = await apiClient.get<LostItem[]>(LOST_AND_FOUND_PATH, {
    params: toQueryParams(filters),
  });

  // Sem endereço de API a requisição cai no dev server, que responde HTML com 200.
  if (!Array.isArray(data)) throw new Error(INVALID_LIST_PAYLOAD_MESSAGE);

  return data;
}

export async function createLostItem(input: LostItemInput): Promise<LostItem> {
  const { data } = await apiClient.post<LostItem>(LOST_AND_FOUND_PATH, input);

  return data;
}

export async function updateLostItem(itemId: string, input: LostItemInput): Promise<LostItem> {
  const { data } = await apiClient.put<LostItem>(`${LOST_AND_FOUND_PATH}/${itemId}`, input);

  return data;
}

/** Recurso próprio: um `PUT` exigiria reenviar campos que a ação não toca. */
async function changeLostItemStatus(itemId: string, status: LostItemStatusEnum): Promise<void> {
  await apiClient.patch(`${LOST_AND_FOUND_PATH}/${itemId}/situacao`, { situacao: status });
}

export async function resolveLostItem(itemId: string): Promise<void> {
  await changeLostItemStatus(itemId, LostItemStatusEnum.RESOLVED);
}

export async function reopenLostItem(itemId: string): Promise<void> {
  await changeLostItemStatus(itemId, LostItemStatusEnum.OPEN);
}

/** Exclusão lógica: o servidor marca Cancelado e registra o motivo. */
export async function cancelLostItem(itemId: string): Promise<void> {
  await apiClient.delete(`${LOST_AND_FOUND_PATH}/${itemId}`);
}
