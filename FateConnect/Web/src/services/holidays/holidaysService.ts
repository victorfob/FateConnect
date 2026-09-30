import { apiClient } from '../httpClient';

const HOLIDAYS_PATH = '/holidays';
const INVALID_PAYLOAD_MESSAGE = 'A API de feriados respondeu algo que não é uma lista de datas.';

/** Feriados do ano em `aaaa-mm-dd`, na ordem do calendário. */
export async function listHolidays(year: number): Promise<string[]> {
  const { data } = await apiClient.get<string[]>(HOLIDAYS_PATH, { params: { year } });

  if (!Array.isArray(data)) throw new Error(INVALID_PAYLOAD_MESSAGE);

  return data;
}
