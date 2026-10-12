import { apiClient } from '../httpClient';
import type { SignupRequest } from './types';

const SIGNUP_PATH = '/users/signup';

export async function signup(payload: SignupRequest): Promise<void> {
  await apiClient.post(SIGNUP_PATH, payload);
}
