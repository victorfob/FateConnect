import { useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';

import { useNotification } from '@app/hooks/useNotification';
import { updatePreferences } from '@app/services/users/preferencesService';
import type { Preferences } from '@app/services/users/preferencesTypes';

import { PREFERENCES_MESSAGES } from '../constants';

type UseNotificationsToggleInput = Readonly<{
  preferences: Preferences;
  replacePreferences: (preferences: Preferences) => void;
}>;

export function useNotificationsToggle({
  preferences,
  replacePreferences,
}: UseNotificationsToggleInput) {
  const { notifyError } = useNotification();

  const mutation = useMutation({
    mutationFn: updatePreferences,
    meta: { notifiesErrorItself: true },
  });

  const toggle = useCallback(
    async (receiveNotifications: boolean) => {
      const chosen: Preferences = { receiveNotifications };
      replacePreferences(chosen);

      try {
        await mutation.mutateAsync(chosen);
      } catch {
        replacePreferences(preferences);
        notifyError(PREFERENCES_MESSAGES.saveFailed);
      }
    },
    [mutation, notifyError, preferences, replacePreferences],
  );

  return { toggle, saving: mutation.isPending };
}
