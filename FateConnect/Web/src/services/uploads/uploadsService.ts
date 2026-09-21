import { apiClient } from '../httpClient';

/**
 * A foto responde por endpoint autenticado, então uma `<img>` apontada para o
 * endereço dela recebe 401: quem a busca é o cliente da API, que leva o token.
 */
export async function fetchStoredImage(imageUrl: string): Promise<Blob> {
  const { data } = await apiClient.get<Blob>(imageUrl, { responseType: 'blob' });

  return data;
}
