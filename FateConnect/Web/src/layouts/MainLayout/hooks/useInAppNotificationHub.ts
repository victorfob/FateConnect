import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { IN_APP_NOTIFICATIONS_QUERY_KEY } from '@app/constants/inAppNotifications';
import { notifySessionExpired } from '@app/services/auth/sessionExpiry';
import { tokenStorage } from '@app/services/auth/tokenStorage';
import {
  createInAppNotificationHub,
  InAppNotificationHubEventEnum,
  keepConnected,
} from '@app/services/inAppNotifications/inAppNotificationHub';

export function useInAppNotificationHub(): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    const connection = createInAppNotificationHub();
    const unmounted = new AbortController();

    const refreshNotifications = () =>
      void queryClient.invalidateQueries({ queryKey: [IN_APP_NOTIFICATIONS_QUERY_KEY] });

    // A aba que clicou em Sair já apagou o token: o aviso do servidor não é para ela.
    const expireSession = () => {
      if (!tokenStorage.getToken()) return;

      tokenStorage.clear();
      notifySessionExpired();
    };

    connection.on(InAppNotificationHubEventEnum.RECEIVE_NOTIFICATION, refreshNotifications);
    connection.on(InAppNotificationHubEventEnum.SESSION_REVOKED, expireSession);
    connection.onreconnected(refreshNotifications);
    // Depois de a reconexão automática desistir, o que chegou na queda se perdeu.
    connection.onclose(async () => {
      await keepConnected(connection, unmounted.signal);
      if (!unmounted.signal.aborted) refreshNotifications();
    });

    void keepConnected(connection, unmounted.signal);

    return () => {
      unmounted.abort();
      void connection.stop();
    };
  }, [queryClient]);
}
