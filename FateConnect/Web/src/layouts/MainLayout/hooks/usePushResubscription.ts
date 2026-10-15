import { useQuery } from '@tanstack/react-query';

import { usePreferences } from '@app/hooks/usePreferences';
import { useSessionQueryKey } from '@app/hooks/useSessionQueryKey';
import { pushPermission, subscribeThisDevice } from '@app/services/inAppNotifications/pushDevice';

const PUSH_RESUBSCRIPTION_QUERY_KEY = 'pushResubscription';

/**
 * Refaz a inscrição em silêncio a cada login no aparelho que já deu a permissão:
 * desligar as notificações apaga os aparelhos na API, e o navegador não fica sabendo.
 */
export function usePushResubscription(): void {
  const permitted = pushPermission() === 'granted';
  const { data: preferences } = usePreferences({ enabled: permitted });
  const { queryKey, signedIn } = useSessionQueryKey(PUSH_RESUBSCRIPTION_QUERY_KEY);

  useQuery({
    queryKey,
    queryFn: async () => {
      await subscribeThisDevice();

      return true;
    },
    enabled: signedIn && permitted && preferences?.receiveNotifications === true,
    staleTime: Infinity,
    retry: false,
    meta: { notifiesErrorItself: true },
  });
}
