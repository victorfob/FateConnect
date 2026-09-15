import { apiClient } from '../httpClient';
import type { PagedResult } from '../types';
import type { Denunciation, DenunciationFilter, DenunciationInput } from './types';

const DENUNCIATIONS_PATH = '/denunciations';

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

/**
 * Sem recorte no nome nem na chamada: quem o decide é o perfil no token, e a
 * mesma função serve a quem denunciou e a quem analisa.
 */
export async function listDenunciations(
  filters?: DenunciationFilter,
): Promise<PagedResult<Denunciation>> {
  const { data } = await apiClient.get<PagedResult<Denunciation>>(DENUNCIATIONS_PATH, {
    params: filters,
  });

  // Sem endereço de API a requisição cai no dev server, que responde HTML com 200.
  if (!Array.isArray(data?.items)) throw new Error(INVALID_LIST_PAYLOAD_MESSAGE);

  return data;
}

export async function createDenunciation(input: DenunciationInput): Promise<Denunciation> {
  const { data } = await apiClient.post<Denunciation>(DENUNCIATIONS_PATH, toFormData(input));

  return data;
}
