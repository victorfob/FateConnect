import type { ProfileTypeEnum } from '../auth/types';
import { apiClient } from '../httpClient';
import type { PagedResult } from '../types';
import type { UserFilter, UserSummary, UserUpdateInput } from './managementTypes';
import type { AccountStatusEnum, User } from './types';

const USERS_PATH = '/users';

const INVALID_LIST_PAYLOAD_MESSAGE = 'A API de usuários respondeu algo que não é uma página.';

function userPath(userId: number): string {
  return `${USERS_PATH}/${userId}`;
}

export async function listUsers(filters?: UserFilter): Promise<PagedResult<UserSummary>> {
  const { data } = await apiClient.get<PagedResult<UserSummary>>(USERS_PATH, { params: filters });

  // Sem endereço de API a requisição cai no dev server, que responde HTML com 200.
  if (!Array.isArray(data?.items)) throw new Error(INVALID_LIST_PAYLOAD_MESSAGE);

  return data;
}

export async function getUser(userId: number): Promise<User> {
  const { data } = await apiClient.get<User>(userPath(userId));

  return data;
}

export async function updateUser(userId: number, input: UserUpdateInput): Promise<User> {
  const { data } = await apiClient.patch<User>(userPath(userId), input);

  return data;
}

export async function changeUserProfile(
  userId: number,
  profileType: ProfileTypeEnum,
): Promise<User> {
  const { data } = await apiClient.patch<User>(`${userPath(userId)}/profile`, { profileType });

  return data;
}

export async function changeUserStatus(userId: number, status: AccountStatusEnum): Promise<User> {
  const { data } = await apiClient.patch<User>(`${userPath(userId)}/status`, { status });

  return data;
}
