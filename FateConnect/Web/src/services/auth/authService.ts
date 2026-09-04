import { apiClient, SessionExpiredError } from '../httpClient';
import { tokenStorage } from './tokenStorage';
import type { LoginRequest, TokenResponse } from './types';

const AUTH_PATH = '/auth';

export async function login(payload: LoginRequest): Promise<TokenResponse> {
  const { data } = await apiClient.post<TokenResponse>(`${AUTH_PATH}/login`, payload);
  tokenStorage.save(data.token);

  return data;
}

/**
 * O cabeçalho vai à mão porque o interceptor lê o token do armazenamento, que a
 * saída já limpou — sem isto a requisição parte sem credencial e o servidor não
 * invalida sessão nenhuma.
 */
async function endServerSession(token: string): Promise<void> {
  try {
    await apiClient.post(`${AUTH_PATH}/logout`, undefined, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    // Falhar aqui não muda nada para quem clicou: a sessão local já saiu.
  }
}

/** Não espera o servidor: a sessão local sai no clique, e o resto vai atrás. */
export function logout(): void {
  const token = tokenStorage.getToken();
  tokenStorage.clear();

  if (token) void endServerSession(token);
}

export async function isSessionStillValid(): Promise<boolean> {
  try {
    await apiClient.get(`${AUTH_PATH}/session`);

    return true;
  } catch (error) {
    return !(error instanceof SessionExpiredError);
  }
}
