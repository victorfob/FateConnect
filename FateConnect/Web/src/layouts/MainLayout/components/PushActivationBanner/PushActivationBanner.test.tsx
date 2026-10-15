import { http, HttpResponse } from 'msw';

import { DISMISS_BANNER_LABEL } from '@app/components/NoticeBanner/constants';
import { server } from '@app/mocks/server';
import { tokenStorage } from '@app/services/auth/tokenStorage';
import type { Preferences } from '@app/services/users/preferencesTypes';
import { render, screen, userEvent, waitFor } from '@app/test/testing-library';
import { tokenWithName } from '@app/test/token';
import {
  DEVICE_SUBSCRIPTION,
  installPushBrowser,
  removePushBrowser,
} from '@app/test/utils/pushBrowser';

import * as C from './constants';
import { PushActivationBanner } from '.';

const PREFERENCES_URL = 'https://api.fateconnect.test/users/me/preferences';

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

const activateButton = () => screen.findByRole('button', { name: C.ACTIVATE_PUSH_LABEL });

describe('PushActivationBanner', () => {
  beforeEach(() => {
    tokenStorage.save(tokenWithName('Maria da Silva'));
  });

  afterEach(() => {
    removePushBrowser();
  });

  it('should subscribe this device when the permission is granted, and leave', async () => {
    const browser = installPushBrowser({ permission: 'default', answer: 'granted' });
    servePreferences({ receiveNotifications: true });

    render(<PushActivationBanner />);
    expect(await screen.findByText(C.PUSH_BANNER_TEXT)).toBeInTheDocument();
    await userEvent.click(await activateButton());

    await waitFor(() => expect(browser.saved).toEqual([DEVICE_SUBSCRIPTION]));
    expect(browser.requestPermission).toHaveBeenCalledOnce();
    expect(screen.queryByText(C.PUSH_BANNER_TEXT)).not.toBeInTheDocument();
  });

  it('should leave without subscribing when the permission is denied', async () => {
    const browser = installPushBrowser({ permission: 'default', answer: 'denied' });
    servePreferences({ receiveNotifications: true });

    render(<PushActivationBanner />);
    await userEvent.click(await activateButton());

    await waitFor(() => expect(screen.queryByText(C.PUSH_BANNER_TEXT)).not.toBeInTheDocument());
    expect(browser.subscribe).not.toHaveBeenCalled();
    expect(browser.saved).toEqual([]);
  });

  it('should show nothing, and ask nothing, where the browser has no push', () => {
    render(<PushActivationBanner />);

    // Sem push, nem as preferências são pedidas: o stub sem rota reprovaria o pedido.
    expect(screen.queryByText(C.PUSH_BANNER_TEXT)).not.toBeInTheDocument();
  });

  it('should show nothing on a device that already answered', () => {
    installPushBrowser({ permission: 'granted' });

    render(<PushActivationBanner />);

    expect(screen.queryByText(C.PUSH_BANNER_TEXT)).not.toBeInTheDocument();
  });

  it('should show nothing while the notifications are off', async () => {
    installPushBrowser({ permission: 'default' });
    const requests = servePreferences({ receiveNotifications: false });

    render(<PushActivationBanner />);

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(screen.queryByText(C.PUSH_BANNER_TEXT)).not.toBeInTheDocument();
  });

  it('should not come back on this device once dismissed', async () => {
    const browser = installPushBrowser({ permission: 'default' });
    servePreferences({ receiveNotifications: true });
    const { unmount } = render(<PushActivationBanner />);

    await userEvent.click(await screen.findByRole('button', { name: DISMISS_BANNER_LABEL }));

    expect(screen.queryByText(C.PUSH_BANNER_TEXT)).not.toBeInTheDocument();
    unmount();

    render(<PushActivationBanner />);
    expect(screen.queryByText(C.PUSH_BANNER_TEXT)).not.toBeInTheDocument();
    expect(browser.requestPermission).not.toHaveBeenCalled();
  });
});
