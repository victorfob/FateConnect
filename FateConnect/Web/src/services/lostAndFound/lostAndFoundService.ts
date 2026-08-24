import { apiClient } from '../httpClient';
import type { LostItem, LostItemFilter } from './types';

const LOST_AND_FOUND_PATH = '/achado';

const INVALID_LIST_PAYLOAD_MESSAGE =
  'A API de achados e perdidos respondeu algo que não é uma lista.';

/** Tradução dos filtros do front para os nomes de parâmetro da API. */
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

  // O tipo do axios é promessa de contrato, não garantia: sem o endereço da API a
  // requisição cai no próprio servidor de desenvolvimento, que responde o HTML da
  // aplicação com status 200. Falhar aqui vira a notificação de erro da tela.
  if (!Array.isArray(data)) throw new Error(INVALID_LIST_PAYLOAD_MESSAGE);

  return data;
}
