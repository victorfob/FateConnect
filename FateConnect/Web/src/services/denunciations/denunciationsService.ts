import { apiClient } from '../httpClient';
import type { Denunciation, DenunciationInput } from './types';

const DENUNCIATIONS_PATH = '/denunciations';

/** Registrar é `multipart`: é o que faz a foto viajar no mesmo pedido. */
function toFormData(input: DenunciationInput): FormData {
  const body = new FormData();

  body.append('Category', input.category);
  body.append('Description', input.description);
  body.append('IsAnonymous', String(input.isAnonymous));
  if (input.image) body.append('Image', input.image);

  return body;
}

export async function createDenunciation(input: DenunciationInput): Promise<Denunciation> {
  const { data } = await apiClient.post<Denunciation>(DENUNCIATIONS_PATH, toFormData(input));

  return data;
}
