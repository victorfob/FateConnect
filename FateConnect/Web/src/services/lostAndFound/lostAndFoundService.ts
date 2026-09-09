import { apiClient } from '../httpClient';
import type { PagedResult } from '../types';
import {
  LostItemStatusEnum,
  type LostItem,
  type LostItemFilter,
  type LostItemInput,
} from './types';

const LOST_AND_FOUND_PATH = '/lostandfound';

const INVALID_LIST_PAYLOAD_MESSAGE =
  'A API de achados e perdidos respondeu algo que não é uma página.';

/** Cadastrar e editar são `multipart`: é o que faz a foto viajar no mesmo pedido. */
function toFormData(input: LostItemInput): FormData {
  const body = new FormData();

  body.append('Name', input.name);
  body.append('LostAndFoundType', input.lostAndFoundType);
  body.append('Place', input.place);
  body.append('OcurredOn', input.ocurredOn);
  body.append('Description', input.description);
  if (input.image) body.append('Image', input.image);

  return body;
}

export async function listLostItems(filters?: LostItemFilter): Promise<PagedResult<LostItem>> {
  const { data } = await apiClient.get<PagedResult<LostItem>>(LOST_AND_FOUND_PATH, {
    params: filters,
  });

  // Sem endereço de API a requisição cai no dev server, que responde HTML com 200.
  if (!Array.isArray(data?.items)) throw new Error(INVALID_LIST_PAYLOAD_MESSAGE);

  return data;
}

export async function createLostItem(input: LostItemInput): Promise<LostItem> {
  const { data } = await apiClient.post<LostItem>(LOST_AND_FOUND_PATH, toFormData(input));

  return data;
}

export async function updateLostItem(itemId: string, input: LostItemInput): Promise<LostItem> {
  const { data } = await apiClient.patch<LostItem>(
    `${LOST_AND_FOUND_PATH}/${itemId}`,
    toFormData(input),
  );

  return data;
}

/** Sozinha no corpo, a situação muda sem que os outros campos do item sejam tocados. */
async function changeLostItemStatus(itemId: string, status: LostItemStatusEnum): Promise<void> {
  const body = new FormData();
  body.append('Status', status);

  await apiClient.patch(`${LOST_AND_FOUND_PATH}/${itemId}`, body);
}

export async function resolveLostItem(itemId: string): Promise<void> {
  await changeLostItemStatus(itemId, LostItemStatusEnum.RESOLVED);
}

export async function restoreLostItem(itemId: string): Promise<void> {
  await changeLostItemStatus(itemId, LostItemStatusEnum.OPEN);
}

/** Exclusão lógica: o servidor marca Excluído e registra o motivo. */
export async function deleteLostItem(itemId: string): Promise<void> {
  await apiClient.delete(`${LOST_AND_FOUND_PATH}/${itemId}`);
}

/**
 * A foto responde por endpoint autenticado, então uma `<img>` apontada para o
 * endereço dela recebe 401: quem a busca é o cliente da API, que leva o token.
 */
export async function fetchStoredImage(imageUrl: string): Promise<Blob> {
  const { data } = await apiClient.get<Blob>(imageUrl, { responseType: 'blob' });

  return data;
}
