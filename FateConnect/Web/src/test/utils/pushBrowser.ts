import { http, HttpResponse } from 'msw';

import { server } from '@app/mocks/server';
import type { PushSubscriptionKeys } from '@app/services/inAppNotifications/types';

type PushBrowserOptions = Readonly<{
  permission: NotificationPermission;
  /** O que a pessoa responde ao pedido; por padrão, a mesma permissão de antes. */
  answer?: NotificationPermission;
}>;

const PUBLIC_KEY_URL = 'https://api.fateconnect.test/inappnotifications/push/public-key';
const SUBSCRIPTIONS_URL = 'https://api.fateconnect.test/inappnotifications/push/subscriptions';
const NO_CONTENT = 204;

/** A chave pública de mentira, em base64url como a API a entrega. */
const FAKE_PUBLIC_KEY = 'AQID';

export const DEVICE_SUBSCRIPTION: PushSubscriptionKeys = {
  endpoint: 'https://push.exemplo.test/aparelho-da-maria',
  p256dh: 'chave-do-aparelho',
  auth: 'segredo-do-aparelho',
};

/**
 * O jsdom não tem push. Põe no lugar um navegador que tem, com a permissão dada,
 * e a API respondendo a chave e guardando o aparelho; devolve o que foi guardado.
 */
export function installPushBrowser({ permission, answer = permission }: PushBrowserOptions) {
  const saved: unknown[] = [];
  server.use(
    http.get(PUBLIC_KEY_URL, () => HttpResponse.json({ publicKey: FAKE_PUBLIC_KEY })),
    http.put(SUBSCRIPTIONS_URL, async ({ request }) => {
      saved.push(await request.json());

      return new HttpResponse(null, { status: NO_CONTENT });
    }),
  );

  const subscription = {
    toJSON: () => ({
      endpoint: DEVICE_SUBSCRIPTION.endpoint,
      keys: { p256dh: DEVICE_SUBSCRIPTION.p256dh, auth: DEVICE_SUBSCRIPTION.auth },
    }),
  };
  const registration = {
    pushManager: {
      getSubscription: vi.fn().mockResolvedValue(null),
      subscribe: vi.fn().mockResolvedValue(subscription),
    },
  };

  let current = permission;
  const requestPermission = vi.fn(() => {
    current = answer;

    return Promise.resolve(answer);
  });

  // O navegador avisa a página quando a permissão muda por fora do pedido.
  const permissionStatus = new EventTarget();
  const changePermission = (next: NotificationPermission) => {
    current = next;
    permissionStatus.dispatchEvent(new Event('change'));
  };

  const fakeNotification = {
    get permission(): NotificationPermission {
      return current;
    },
    requestPermission,
  };

  // O código só pergunta se o `PushManager` existe; quem inscreve é o `registration` acima.
  vi.stubGlobal('Notification', fakeNotification);
  vi.stubGlobal('PushManager', {});
  Object.defineProperty(navigator, 'permissions', {
    configurable: true,
    value: { query: vi.fn().mockResolvedValue(permissionStatus) },
  });
  Object.defineProperty(navigator, 'serviceWorker', {
    configurable: true,
    value: Object.assign(new EventTarget(), {
      register: vi.fn().mockResolvedValue(registration),
      ready: Promise.resolve(registration),
      startMessages: vi.fn(),
    }),
  });

  return {
    saved,
    requestPermission,
    changePermission,
    subscribe: registration.pushManager.subscribe,
  };
}

export function removePushBrowser(): void {
  vi.unstubAllGlobals();
  Reflect.deleteProperty(navigator, 'serviceWorker');
  Reflect.deleteProperty(navigator, 'permissions');
}
