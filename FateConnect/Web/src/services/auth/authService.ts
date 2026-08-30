import { apiClient, SessionExpiredError } from '../httpClient';
import { tokenStorage } from './tokenStorage';
import type { LoginRequest, TokenResponse } from './types';

const AUTH_PATH = '/auth';

export async function login(payload: LoginRequest): Promise<TokenResponse> {
  const { data } = await apiClient.post<TokenResponse>(`${AUTH_PATH}/login`, payload);
  tokenStorage.save(data.token);

  return data;
}

export function logout(): void {
  tokenStorage.clear();
}

export async function isSessionStillValid(): Promise<boolean> {
  try {
    await apiClient.get(`${AUTH_PATH}/session`);

    return true;
  } catch (error) {
    return !(error instanceof SessionExpiredError);
  }
}
