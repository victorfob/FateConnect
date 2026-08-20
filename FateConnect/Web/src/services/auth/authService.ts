import { apiClient } from '../httpClient';
import { tokenStorage } from './tokenStorage';
import type { LoginRequest, TokenResponse } from './types';

const AUTH_PATH = '/auth';

export async function login(payload: LoginRequest): Promise<TokenResponse> {
  const { data } = await apiClient.post<TokenResponse>(`${AUTH_PATH}/login`, payload);
  tokenStorage.save(data.token, data.nomeCompleto);

  return data;
}

export function logout(): void {
  tokenStorage.clear();
}
