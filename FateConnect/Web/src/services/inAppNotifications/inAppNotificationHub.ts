import { HubConnectionBuilder, LogLevel, type HubConnection } from '@microsoft/signalr';

import { tokenStorage } from '../auth/tokenStorage';

const HUB_PATH = '/hubs/notifications';
const RETRY_DELAY_MS = 5000;

export enum InAppNotificationHubEventEnum {
  RECEIVE_NOTIFICATION = 'ReceiveNotification',
  SESSION_REVOKED = 'SessionRevoked',
}

function waitBeforeRetry(signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, RETRY_DELAY_MS);

    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        resolve();
      },
      { once: true },
    );
  });
}

/**
 * O token vai na conexão porque o navegador não põe cabeçalho num WebSocket. O
 * registro da biblioteca fica desligado porque a falha já é tratada aqui, que
 * tenta de novo: ele só repetiria o erro no console.
 */
export function createInAppNotificationHub(): HubConnection {
  return new HubConnectionBuilder()
    .withUrl(`${import.meta.env.VITE_API_URL}${HUB_PATH}`, {
      accessTokenFactory: () => tokenStorage.getToken() ?? '',
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.None)
    .build();
}

/**
 * A reconexão automática só cobre a queda de uma conexão que já abriu: a
 * primeira tentativa, e a que vem depois de ela desistir, ficam por conta daqui.
 */
export async function keepConnected(connection: HubConnection, signal: AbortSignal): Promise<void> {
  if (signal.aborted) return;

  try {
    await connection.start();
  } catch {
    await waitBeforeRetry(signal);
    await keepConnected(connection, signal);
  }
}
