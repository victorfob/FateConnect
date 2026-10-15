import { useCallback, useState } from 'react';

import { usePreferences } from '@app/hooks/usePreferences';
import { usePushSubscription } from '@app/hooks/usePushSubscription';
import { askForPushPermission, pushPermission } from '@app/services/inAppNotifications/pushDevice';

import { pushBannerStorage } from '../storage/pushBannerStorage';

/** O aviso vale enquanto o aparelho não respondeu à permissão e as notificações estão ligadas. */
export function usePushActivation() {
  const [permission, setPermission] = useState(pushPermission);
  const [dismissed, setDismissed] = useState(pushBannerStorage.isDismissed);
  const unanswered = permission === 'default' && !dismissed;
  const { data: preferences } = usePreferences({ enabled: unanswered });
  const subscribeThisDevice = usePushSubscription();

  const activate = useCallback(() => {
    void askForPushPermission().then((answer) => {
      setPermission(answer);
      if (answer === 'granted') subscribeThisDevice();
    });
  }, [subscribeThisDevice]);

  const dismiss = useCallback(() => {
    pushBannerStorage.dismiss();
    setDismissed(true);
  }, []);

  return { visible: unanswered && preferences?.receiveNotifications === true, activate, dismiss };
}
