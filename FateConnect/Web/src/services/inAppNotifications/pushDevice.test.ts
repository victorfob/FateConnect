import { http, HttpResponse } from 'msw';

import { server } from '@app/mocks/server';
import { installPushBrowser, removePushBrowser } from '@app/test/utils/pushBrowser';

import { askForPushPermission, pushPermission, subscribeThisDevice } from './pushDevice';

const PUBLIC_KEY_URL = 'https://api.fateconnect.test/inappnotifications/push/public-key';

describe('pushDevice', () => {
  afterEach(() => {
    removePushBrowser();
  });

  it('should answer nothing, and ask nothing, where the browser has no push', async () => {
    expect(pushPermission()).toBeNull();
    await expect(askForPushPermission()).resolves.toBeNull();
  });

  it('should not ask again once the device answered', async () => {
    const browser = installPushBrowser({ permission: 'denied' });

    await expect(askForPushPermission()).resolves.toBe('denied');
    expect(browser.requestPermission).not.toHaveBeenCalled();
  });

  it('should subscribe with the public key of the api, in bytes', async () => {
    const browser = installPushBrowser({ permission: 'granted' });

    await subscribeThisDevice();

    expect(browser.subscribe).toHaveBeenCalledWith({
      userVisibleOnly: true,
      applicationServerKey: new Uint8Array([1, 2, 3]),
    });
  });

  it('should reuse the subscription the browser already has, without asking for the key', async () => {
    const browser = installPushBrowser({ permission: 'granted' });
    const registration = await navigator.serviceWorker.ready;
    const existing = await browser.subscribe();
    vi.mocked(registration.pushManager.getSubscription).mockResolvedValue(existing);
    browser.subscribe.mockClear();
    server.use(http.get(PUBLIC_KEY_URL, () => HttpResponse.error()));

    await subscribeThisDevice();

    expect(browser.subscribe).not.toHaveBeenCalled();
    expect(browser.saved).toHaveLength(1);
  });

  it('should refuse a subscription that came without the keys', async () => {
    const browser = installPushBrowser({ permission: 'granted' });
    browser.subscribe.mockResolvedValue({ toJSON: () => ({ endpoint: 'https://push.test/x' }) });

    await expect(subscribeThisDevice()).rejects.toThrow();
    expect(browser.saved).toEqual([]);
  });

  it('should refuse a public key answer that is not a key', async () => {
    const browser = installPushBrowser({ permission: 'granted' });
    server.use(http.get(PUBLIC_KEY_URL, () => HttpResponse.text('<html></html>')));

    await expect(subscribeThisDevice()).rejects.toThrow();
    expect(browser.subscribe).not.toHaveBeenCalled();
  });
});
