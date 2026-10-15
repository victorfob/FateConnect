import { RoutePathEnum } from '@app/routes/paths';

/** ⛔ O mesmo nome do `public/sw.js`, que manda o toque para a janela já aberta. */
const OPEN_NOTIFICATION_MESSAGE = 'open-notification';

/** Só a rota que abre o aviso: a mensagem não leva a pessoa para nenhum outro lugar. */
export function openNotificationUrlOf(message: unknown): string | null {
  if (typeof message !== 'object' || message === null) return null;
  if (Reflect.get(message, 'kind') !== OPEN_NOTIFICATION_MESSAGE) return null;

  const url: unknown = Reflect.get(message, 'url');
  if (typeof url !== 'string' || !url.startsWith(`${RoutePathEnum.OPEN_NOTIFICATION}?`))
    return null;

  return url;
}
