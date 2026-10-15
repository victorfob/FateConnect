import { pushedNotificationOf } from '@app/pages/OpenNotification/helpers';
import { RoutePathEnum } from '@app/routes/paths';
import { openNotificationUrlOf } from '@app/utils/pushNotificationClick';

import { InAppNotificationTypeEnum } from './types';

type WorkerEvent = { waitUntil: (work: Promise<unknown>) => void } & Record<string, unknown>;
type FakeWindow = { focus: ReturnType<typeof vi.fn>; postMessage: ReturnType<typeof vi.fn> };

const ORIGIN = 'https://fateconnect.test';

/** Por variável: o arquivo é JavaScript solto, sem tipos, e o `tsc` recusaria o caminho literal. */
const SERVICE_WORKER_MODULE = '../../../public/sw.js';

const PAYLOAD = {
  id: 7,
  type: InAppNotificationTypeEnum.RIDE_TO_NEIGHBORHOOD,
  content: 'Nova carona para Jardim Toledo.',
  referenceId: 'carona-42',
};

/** Roda o `public/sw.js` de verdade num `self` falso, que guarda o que ele registra e chama. */
async function loadServiceWorker(openWindows: FakeWindow[] = []) {
  const listeners = new Map<string, (event: WorkerEvent) => void>();
  const showNotification = vi.fn().mockResolvedValue(undefined);
  const openWindow = vi.fn().mockResolvedValue(null);
  const self = {
    addEventListener: (type: string, listener: (event: WorkerEvent) => void) =>
      listeners.set(type, listener),
    skipWaiting: vi.fn(),
    registration: { showNotification },
    clients: { matchAll: vi.fn().mockResolvedValue(openWindows), openWindow },
  };
  vi.stubGlobal('self', self);
  vi.resetModules();
  await import(/* @vite-ignore */ SERVICE_WORKER_MODULE);

  async function dispatch(type: string, fields: Record<string, unknown>) {
    const pending: Promise<unknown>[] = [];
    listeners.get(type)?.({ ...fields, waitUntil: (work) => pending.push(work) });
    await Promise.all(pending);
  }

  return { dispatch, showNotification, openWindow, listeners };
}

function tapEvent(data: unknown) {
  return { notification: { data, close: vi.fn() } };
}

describe('public/sw.js', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should listen only to push, the tap and its own install, never to fetch', async () => {
    const { listeners } = await loadServiceWorker();

    expect([...listeners.keys()].sort((left, right) => left.localeCompare(right))).toEqual([
      'install',
      'notificationclick',
      'push',
    ]);
  });

  it('should show the notification with the app name, the bell text and the app icon', async () => {
    const worker = await loadServiceWorker();

    await worker.dispatch('push', { data: { json: () => PAYLOAD } });

    expect(worker.showNotification).toHaveBeenCalledWith('FateConnect', {
      body: PAYLOAD.content,
      icon: '/icon-192.png',
      tag: '7',
      data: PAYLOAD,
    });
  });

  it('should show nothing for a push without content', async () => {
    const worker = await loadServiceWorker();

    await worker.dispatch('push', { data: null });

    expect(worker.showNotification).not.toHaveBeenCalled();
  });

  it('should open a window on the route that reads the notification back', async () => {
    const worker = await loadServiceWorker();

    await worker.dispatch('notificationclick', tapEvent(PAYLOAD));

    const url = new URL(String(worker.openWindow.mock.calls[0]?.[0]), ORIGIN);
    expect(url.pathname).toBe(RoutePathEnum.OPEN_NOTIFICATION);
    expect(pushedNotificationOf(url.searchParams)).toEqual({
      id: PAYLOAD.id,
      type: PAYLOAD.type,
      referenceId: PAYLOAD.referenceId,
    });
  });

  it.each(Object.values(InAppNotificationTypeEnum))(
    'should write the type %s the way the route reads it',
    async (type) => {
      const worker = await loadServiceWorker();

      await worker.dispatch('notificationclick', tapEvent({ ...PAYLOAD, type, referenceId: null }));

      const url = new URL(String(worker.openWindow.mock.calls[0]?.[0]), ORIGIN);
      expect(pushedNotificationOf(url.searchParams)?.type).toBe(type);
    },
  );

  it('should hand the tap to the window already open, focused, instead of opening another', async () => {
    const openApp: FakeWindow = {
      focus: vi.fn().mockResolvedValue(undefined),
      postMessage: vi.fn(),
    };
    const worker = await loadServiceWorker([openApp]);
    const event = tapEvent(PAYLOAD);

    await worker.dispatch('notificationclick', event);

    expect(event.notification.close).toHaveBeenCalled();
    expect(worker.openWindow).not.toHaveBeenCalled();
    expect(openApp.focus).toHaveBeenCalled();
    const url = openNotificationUrlOf(openApp.postMessage.mock.calls[0]?.[0]);
    expect(url?.startsWith(`${RoutePathEnum.OPEN_NOTIFICATION}?`)).toBe(true);
  });
});
