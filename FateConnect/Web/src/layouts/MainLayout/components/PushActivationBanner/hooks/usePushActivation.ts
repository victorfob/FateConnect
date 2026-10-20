import { useCallback, useEffect, useState } from 'react';

import { usePreferences } from '@app/hooks/usePreferences';
import { usePushSubscription } from '@app/hooks/usePushSubscription';
import {
  askForPushPermission,
  pushPermission,
  watchPushPermission,
} from '@app/services/inAppNotifications/pushDevice';

import { pushBannerStorage } from '../storage/pushBannerStorage';

/** O aviso vale enquanto o aparelho não respondeu à permissão e as notificações estão ligadas. */
export function usePushActivation() {
  const [initialPermission] = useState(pushPermission);
  const [permission, setPermission] = useState(initialPermission);
  const [dismissed, setDismissed] = useState(pushBannerStorage.isDismissed);
  const unanswered = permission === 'default' && !dismissed;
  const { data: preferences } = usePreferences({ enabled: unanswered });
  const subscribeThisDevice = usePushSubscription();

  // Vale a permissão do navegador, não a resposta do pedido: as duas podem divergir.
  const readPermission = useCallback(() => setPermission(pushPermission()), []);

  useEffect(() => {
    if (!unanswered) return;

    const stopWatching = new AbortController();
    watchPushPermission(readPermission, stopWatching.signal);

    return () => stopWatching.abort();
  }, [unanswered, readPermission]);

  useEffect(() => {
    if (initialPermission === 'default' && permission === 'granted') subscribeThisDevice();
  }, [initialPermission, permission, subscribeThisDevice]);

  const activate = useCallback(() => {
    void askForPushPermission().then(readPermission);
  }, [readPermission]);

  const dismiss = useCallback(() => {
    pushBannerStorage.dismiss();
    setDismissed(true);
  }, []);

  return { visible: unanswered && preferences?.receiveNotifications === true, activate, dismiss };
}
