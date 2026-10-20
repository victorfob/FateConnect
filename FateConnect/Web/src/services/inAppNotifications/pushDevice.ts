import { base64UrlToBytes } from '@app/utils/base64Url';

import { getPushPublicKey, savePushSubscription } from './pushService';

const SERVICE_WORKER_PATH = '/sw.js';

const INCOMPLETE_SUBSCRIPTION_MESSAGE = 'O navegador devolveu a inscrição do push sem as chaves.';

/** No iPhone o push só existe no app instalado: no Safari, nenhuma das três peças aparece. */
export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

/** `null` onde o navegador não tem push: quem chama não mostra nada. */
export function pushPermission(): NotificationPermission | null {
  if (!isPushSupported()) return null;

  return Notification.permission;
}

/**
 * ⛔ Chamar no próprio toque, antes de qualquer `await`: o Safari só abre o
 * pedido de permissão dentro do gesto de quem tocou.
 */
export function askForPushPermission(): Promise<NotificationPermission | null> {
  const permission = pushPermission();
  if (permission !== 'default') return Promise.resolve(permission);

  return Notification.requestPermission();
}

/**
 * A permissão pode mudar sem o pedido devolver a resposta: o pedido discreto do
 * Chrome no Android, liberado depois na barra, ou as configurações do site.
 */
export function watchPushPermission(
  onChange: (permission: NotificationPermission | null) => void,
  signal: AbortSignal,
): void {
  if (!isPushSupported() || !('permissions' in navigator)) return;

  void navigator.permissions
    .query({ name: 'notifications' })
    .then((status) =>
      status.addEventListener('change', () => onChange(pushPermission()), { signal }),
    )
    .catch(() => undefined);
}

async function deviceSubscription(registration: ServiceWorkerRegistration) {
  const existing = await registration.pushManager.getSubscription();
  if (existing) return existing;

  const publicKey = await getPushPublicKey();

  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: base64UrlToBytes(publicKey),
  });
}

/** Inscreve o aparelho ou repete a inscrição dele: a API apaga os aparelhos quando a pessoa desliga. */
export async function subscribeThisDevice(): Promise<void> {
  await navigator.serviceWorker.register(SERVICE_WORKER_PATH);
  const registration = await navigator.serviceWorker.ready;
  const { endpoint, keys } = (await deviceSubscription(registration)).toJSON();

  if (!endpoint || !keys?.p256dh || !keys.auth) throw new Error(INCOMPLETE_SUBSCRIPTION_MESSAGE);

  await savePushSubscription({ endpoint, p256dh: keys.p256dh, auth: keys.auth });
}
