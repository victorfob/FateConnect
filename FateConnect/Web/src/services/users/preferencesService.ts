import { apiClient } from '../httpClient';
import type { Preferences } from './preferencesTypes';

const PREFERENCES_PATH = '/users/me/preferences';

export async function getPreferences(): Promise<Preferences> {
  const { data } = await apiClient.get<Preferences>(PREFERENCES_PATH);

  return data;
}

export async function updatePreferences(preferences: Preferences): Promise<void> {
  await apiClient.patch(PREFERENCES_PATH, preferences);
}
