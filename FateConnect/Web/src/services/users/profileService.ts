import { tokenStorage } from '../auth/tokenStorage';
import type { TokenResponse } from '../auth/types';
import { apiClient } from '../httpClient';
import type { PasswordChangeInput, ProfileInput } from './profileTypes';
import type { User } from './types';

const PROFILE_PATH = '/users/me';

/** Salvar é `multipart`: é o que faz a foto viajar no mesmo pedido. */
function toFormData(input: ProfileInput): FormData {
  const body = new FormData();

  body.append('FullName', input.fullName);
  body.append('BirthDate', input.birthDate);
  body.append('Gender', input.gender);
  body.append('Phone', input.phone);
  body.append('ContactEmail', input.contactEmail);
  // Vazio apaga o bairro: a API distingue o vazio da ausência do campo.
  body.append('Neighborhood', input.neighborhood);
  if (input.image) body.append('Image', input.image);

  return body;
}

export async function getProfile(): Promise<User> {
  const { data } = await apiClient.get<User>(PROFILE_PATH);

  return data;
}

export async function updateProfile(input: ProfileInput): Promise<User> {
  const { data } = await apiClient.patch<User>(PROFILE_PATH, toFormData(input));

  return data;
}

export async function removeProfileImage(): Promise<void> {
  await apiClient.delete(`${PROFILE_PATH}/image`);
}

/** A troca encerra as outras sessões e devolve o token que mantém esta de pé. */
export async function changePassword(input: PasswordChangeInput): Promise<void> {
  const { data } = await apiClient.patch<TokenResponse>(`${PROFILE_PATH}/password`, input);
  tokenStorage.save(data.token);
}

export async function deactivateAccount(): Promise<void> {
  await apiClient.post(`${PROFILE_PATH}/deactivate`);
  tokenStorage.clear();
}
