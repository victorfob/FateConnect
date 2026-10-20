import { useCallback, useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';

import { PREFERENCES_MESSAGES } from '@app/constants/preferences';
import { useNotification } from '@app/hooks/useNotification';
import { usePushSubscription } from '@app/hooks/usePushSubscription';
import {
  askForPushPermission,
  pushPermission,
  watchPushPermission,
} from '@app/services/inAppNotifications/pushDevice';
import { updatePreferences } from '@app/services/users/preferencesService';
import type { Preferences } from '@app/services/users/preferencesTypes';

type UseNotificationsToggleInput = Readonly<{
  preferences: Preferences;
  replacePreferences: (preferences: Preferences) => void;
}>;

const NO_PERMISSION_ASKED: Promise<null> = Promise.resolve(null);

function permissionAsked(turningOn: boolean): Promise<NotificationPermission | null> {
  if (!turningOn) return NO_PERMISSION_ASKED;

  return askForPushPermission();
}

export function useNotificationsToggle({
  preferences,
  replacePreferences,
}: UseNotificationsToggleInput) {
  const { notifyError } = useNotification();
  const subscribeThisDevice = usePushSubscription();
  const [awaitingGrant, setAwaitingGrant] = useState(false);
  const watchingGrant = awaitingGrant && preferences.receiveNotifications;

  useEffect(() => {
    if (!watchingGrant) return;

    const stopWatching = new AbortController();
    watchPushPermission((permission) => {
      if (permission !== 'granted') return;

      setAwaitingGrant(false);
      subscribeThisDevice();
    }, stopWatching.signal);

    return () => stopWatching.abort();
  }, [watchingGrant, subscribeThisDevice]);

  const mutation = useMutation({
    mutationFn: updatePreferences,
    meta: { notifiesErrorItself: true },
  });

  const toggle = useCallback(
    async (receiveNotifications: boolean) => {
      // Primeiro, ainda dentro do toque: fora dele o Safari não abre o pedido.
      const permission = permissionAsked(receiveNotifications);
      const chosen: Preferences = { receiveNotifications };
      replacePreferences(chosen);

      try {
        await mutation.mutateAsync(chosen);
      } catch {
        replacePreferences(preferences);
        notifyError(PREFERENCES_MESSAGES.saveFailed);
        return;
      }

      if (!receiveNotifications) return;

      // Vale a permissão do navegador, não a resposta do pedido: as duas podem divergir.
      await permission;
      const current = pushPermission();
      if (current === 'granted') {
        subscribeThisDevice();
        return;
      }

      if (current === 'default') setAwaitingGrant(true);
    },
    [mutation, notifyError, preferences, replacePreferences, subscribeThisDevice],
  );

  return { toggle, saving: mutation.isPending };
}
