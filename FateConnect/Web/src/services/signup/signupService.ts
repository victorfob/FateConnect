import { tokenStorage } from '../auth/tokenStorage';
import type { TokenResponse } from '../auth/types';
import { apiClient } from '../httpClient';
import type { SignupRequest } from './types';

const SIGNUP_PATH = '/users/signup';

export async function signup(payload: SignupRequest): Promise<TokenResponse> {
  const { data } = await apiClient.post<TokenResponse>(SIGNUP_PATH, payload);
  tokenStorage.save(data.token);

  return data;
}
