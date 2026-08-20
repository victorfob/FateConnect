import axios from 'axios';

import type { CepAddress } from './types';

const PRIMARY_PROVIDER = 'https://viacep.com.br/ws';
const FALLBACK_PROVIDER = 'https://opencep.com/v1';

/**
 * Consulta o CEP no provedor primário e, em falha de rede ou HTTP, tenta o
 * secundário. Usa `axios` direto, sem o client da aplicação: são serviços
 * externos, que não recebem o token nem o tratamento de erro da nossa API.
 */
export async function lookupCep(zipDigits: string, signal?: AbortSignal): Promise<CepAddress> {
  try {
    const { data } = await axios.get<CepAddress>(`${PRIMARY_PROVIDER}/${zipDigits}/json/`, {
      signal,
    });

    return data;
  } catch (error) {
    // Consulta cancelada não é falha do provedor: não vale tentar o secundário.
    if (axios.isCancel(error)) throw error;

    const { data } = await axios.get<CepAddress>(`${FALLBACK_PROVIDER}/${zipDigits}.json`, {
      signal,
    });

    return data;
  }
}

/** O provedor primário sinaliza CEP inexistente no corpo, não no status. */
export function isCepNotFound(address: CepAddress): boolean {
  return address.erro === 'true';
}
