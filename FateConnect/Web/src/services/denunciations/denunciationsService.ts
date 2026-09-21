import { apiClient } from '../httpClient';
import type { PagedResult } from '../types';
import type {
  Denunciation,
  DenunciationFilter,
  DenunciationInput,
  DenunciationStatusEnum,
} from './types';

const DENUNCIATIONS_PATH = '/denunciations';

const MY_DENUNCIATIONS_PATH = `${DENUNCIATIONS_PATH}/mine`;

const INVALID_LIST_PAYLOAD_MESSAGE = 'A API de denúncias respondeu algo que não é uma página.';

/** Registrar é `multipart`: é o que faz a foto viajar no mesmo pedido. */
function toFormData(input: DenunciationInput): FormData {
  const body = new FormData();

  body.append('Category', input.category);
  body.append('Description', input.description);
  body.append('IsAnonymous', String(input.isAnonymous));
  if (input.image) body.append('Image', input.image);

  return body;
}

async function listFrom(
  path: string,
  filters?: DenunciationFilter,
): Promise<PagedResult<Denunciation>> {
  const { data } = await apiClient.get<PagedResult<Denunciation>>(path, { params: filters });

  // Sem endereço de API a requisição cai no dev server, que responde HTML com 200.
  if (!Array.isArray(data?.items)) throw new Error(INVALID_LIST_PAYLOAD_MESSAGE);

  return data;
}

/** A listagem de todas, que a API abre só a quem administra. */
export async function listDenunciations(
  filters?: DenunciationFilter,
): Promise<PagedResult<Denunciation>> {
  return listFrom(DENUNCIATIONS_PATH, filters);
}

/** O recorte é a rota, não o perfil de quem pede: `/mine` traz o que a pessoa enviou. */
export async function listMyDenunciations(
  filters?: DenunciationFilter,
): Promise<PagedResult<Denunciation>> {
  return listFrom(MY_DENUNCIATIONS_PATH, filters);
}

/** A API recusa par inválido com 400, mas a tela não deve chegar a pedi-lo. */
export async function updateDenunciationStatus(
  denunciationId: string,
  status: DenunciationStatusEnum,
): Promise<void> {
  await apiClient.patch(`${DENUNCIATIONS_PATH}/${denunciationId}/status`, { Status: status });
}

export async function createDenunciation(input: DenunciationInput): Promise<Denunciation> {
  const { data } = await apiClient.post<Denunciation>(DENUNCIATIONS_PATH, toFormData(input));

  return data;
}
