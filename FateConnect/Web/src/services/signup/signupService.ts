import { apiClient } from '../httpClient';
import type { SignupRequest, SignupResponse } from './types';

const SIGNUP_PATH = '/users/signup';

export async function signup(payload: SignupRequest): Promise<SignupResponse> {
  const { data } = await apiClient.post<SignupResponse>(SIGNUP_PATH, payload);

  return data;
}
