import { http, HttpResponse } from 'msw';

import { server } from '@app/mocks/server';
import { tokenStorage } from '@app/services/auth/tokenStorage';
import type { Preferences } from '@app/services/users/preferencesTypes';
import { render, waitFor } from '@app/test/testing-library';
import { tokenWithName } from '@app/test/token';
import {
  DEVICE_SUBSCRIPTION,
  installPushBrowser,
  removePushBrowser,
} from '@app/test/utils/pushBrowser';

import { usePushResubscription } from './usePushResubscription';

const PREFERENCES_URL = 'https://api.fateconnect.test/users/me/preferences';

function Resubscriber() {
  usePushResubscription();

  return null;
}

function servePreferences(preferences: Preferences) {
  const requests: string[] = [];
  server.use(
    http.get(PREFERENCES_URL, () => {
      requests.push(PREFERENCES_URL);

      return HttpResponse.json(preferences);
    }),
  );

  return requests;
}

describe('usePushResubscription', () => {
  beforeEach(() => {
    tokenStorage.save(tokenWithName('Maria da Silva'));
  });

  afterEach(() => {
    removePushBrowser();
  });

  it('should subscribe again, in silence, the device that already allowed', async () => {
    const browser = installPushBrowser({ permission: 'granted' });
    servePreferences({ receiveNotifications: true });

    render(<Resubscriber />);

    await waitFor(() => expect(browser.saved).toEqual([DEVICE_SUBSCRIPTION]));
    expect(browser.requestPermission).not.toHaveBeenCalled();
  });

  it('should leave the device alone while the notifications are off', async () => {
    const browser = installPushBrowser({ permission: 'granted' });
    const requests = servePreferences({ receiveNotifications: false });

    render(<Resubscriber />);

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(browser.subscribe).not.toHaveBeenCalled();
    expect(browser.saved).toEqual([]);
  });

  it('should not even read the preferences on a device that did not allow', () => {
    // Sem rota para as preferências no stub: lê-las reprovaria o caso.
    installPushBrowser({ permission: 'denied' });

    render(<Resubscriber />);
  });
});
