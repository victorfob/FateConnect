import type { Preferences, PreferencesChange } from '@app/services/users/preferencesTypes';

type DirtyPreferences = Partial<Record<keyof Preferences, boolean>>;

export function changedPreferences(
  values: Preferences,
  dirtyFields: DirtyPreferences,
): PreferencesChange {
  const change: PreferencesChange = {};

  if (dirtyFields.receiveEmails) change.receiveEmails = values.receiveEmails;
  if (dirtyFields.receiveNotifications) change.receiveNotifications = values.receiveNotifications;

  return change;
}
