import { http, HttpResponse } from 'msw';

import { BACK_TO_MENU_LABEL } from '@app/components/BackToMenu/constants';
import { SAVE_BAR_TEXTS } from '@app/components/SaveBar/constants';
import { THEME_LABEL, THEME_OPTIONS, triggerLabel } from '@app/components/ThemeMenu/constants';
import { server } from '@app/mocks/server';
import { RoutePathEnum } from '@app/routes/paths';
import { tokenStorage } from '@app/services/auth/tokenStorage';
import type { Preferences as StoredPreferences } from '@app/services/users/preferencesTypes';
import { cleanup, screen, userEvent, waitFor } from '@app/test/testing-library';
import { tokenWithName } from '@app/test/token';
import { renderAtRoute } from '@app/test/utils/renderAtRoute';

import {
  NOTIFICATIONS_DESCRIPTION,
  NOTIFICATIONS_LABEL,
} from './components/NotificationsSwitch/constants';
import * as C from './constants';
import { Preferences } from '.';

const PREFERENCES_URL = 'https://api.fateconnect.test/users/me/preferences';

const NO_CONTENT = 204;
const SERVER_ERROR = 500;

/** Cobre a tentativa inicial, os 2s de espera e a repetição. */
const RETRY_WINDOW_MS = 5000;

const STORED: StoredPreferences = { receiveNotifications: true };

const [AUTOMATIC = '', , DARK = ''] = THEME_OPTIONS.map((option) => option.label);

function servePreferences(preferences = STORED) {
  server.use(http.get(PREFERENCES_URL, () => HttpResponse.json(preferences)));
}

async function renderPreferences(preferences = STORED) {
  servePreferences(preferences);
  const router = renderAtRoute(RoutePathEnum.PREFERENCES, <Preferences />);
  await screen.findByRole('switch', { name: NOTIFICATIONS_LABEL });

  return router;
}

function recordSavedBodies() {
  const bodies: unknown[] = [];
  server.use(
    http.patch(PREFERENCES_URL, async ({ request }) => {
      bodies.push(await request.json());

      return new HttpResponse(null, { status: NO_CONTENT });
    }),
  );

  return bodies;
}

const notificationsSwitch = () => screen.getByRole('switch', { name: NOTIFICATIONS_LABEL });

const themeTrigger = (optionLabel: string) =>
  screen.getByRole('button', { name: triggerLabel(optionLabel) });

function documentBackground() {
  return getComputedStyle(document.body).backgroundColor;
}

async function chooseTheme(from: string, to: string) {
  await userEvent.click(themeTrigger(from));
  await userEvent.click(await screen.findByRole('button', { name: to }));
}

describe('Preferences', () => {
  beforeEach(() => {
    tokenStorage.save(tokenWithName('Maria da Silva'));
  });

  it('should title the screen and offer the way back to the menu', async () => {
    await renderPreferences();

    expect(screen.getByRole('heading', { name: C.PREFERENCES_TITLE })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: BACK_TO_MENU_LABEL })).toHaveAttribute(
      'href',
      RoutePathEnum.MENU,
    );
  });

  it('should put the theme and the notifications in one untitled card, with no save bar', async () => {
    await renderPreferences();

    expect(screen.getByText(THEME_LABEL)).toBeInTheDocument();
    expect(screen.getByText(C.THEME_DESCRIPTION)).toBeInTheDocument();
    expect(notificationsSwitch()).toHaveAccessibleDescription(NOTIFICATIONS_DESCRIPTION);
    expect(screen.getAllByRole('switch')).toHaveLength(1);
    expect(screen.getAllByRole('heading')).toHaveLength(1);
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: SAVE_BAR_TEXTS.save })).not.toBeInTheDocument();
  });

  it('should apply the chosen theme at once', async () => {
    await renderPreferences();
    const lightBackground = documentBackground();

    await chooseTheme(AUTOMATIC, DARK);

    expect(themeTrigger(DARK)).toBeInTheDocument();
    expect(documentBackground()).not.toBe(lightBackground);
  });

  it('should keep the chosen theme when the screen is mounted again', async () => {
    await renderPreferences();
    await chooseTheme(AUTOMATIC, DARK);

    cleanup();
    await renderPreferences();

    expect(themeTrigger(DARK)).toBeInTheDocument();
  });

  it('should open the switch with the stored choice', async () => {
    await renderPreferences({ receiveNotifications: false });

    expect(notificationsSwitch()).not.toBeChecked();
  });

  it('should save each toggle at once, without a notice', async () => {
    const bodies = recordSavedBodies();
    await renderPreferences();

    await userEvent.click(notificationsSwitch());
    await waitFor(() => expect(notificationsSwitch()).toBeEnabled());
    await userEvent.click(notificationsSwitch());
    await waitFor(() => expect(notificationsSwitch()).toBeEnabled());

    expect(bodies).toEqual([{ receiveNotifications: false }, { receiveNotifications: true }]);
    expect(notificationsSwitch()).toBeChecked();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('should show the new position and hold the switch while the api answers', async () => {
    let respond: VoidFunction = () => {};
    const held = new Promise<void>((resolve) => {
      respond = resolve;
    });
    server.use(
      http.patch(PREFERENCES_URL, async () => {
        await held;

        return new HttpResponse(null, { status: NO_CONTENT });
      }),
    );
    await renderPreferences();

    await userEvent.click(notificationsSwitch());

    await waitFor(() => expect(notificationsSwitch()).toBeDisabled());
    expect(notificationsSwitch()).not.toBeChecked();

    respond();

    await waitFor(() => expect(notificationsSwitch()).toBeEnabled());
    expect(notificationsSwitch()).not.toBeChecked();
  });

  it('should go back to the stored choice and warn once when the save fails', async () => {
    server.use(http.patch(PREFERENCES_URL, () => new HttpResponse(null, { status: SERVER_ERROR })));
    await renderPreferences();

    await userEvent.click(notificationsSwitch());

    expect(await screen.findByText(C.PREFERENCES_MESSAGES.saveFailed)).toBeInTheDocument();
    expect(screen.getAllByRole('alert')).toHaveLength(1);
    expect(notificationsSwitch()).toBeChecked();
    expect(notificationsSwitch()).toBeEnabled();
  });

  it('should keep the theme and warn when the preferences do not load', async () => {
    server.use(http.get(PREFERENCES_URL, () => new HttpResponse(null, { status: SERVER_ERROR })));
    renderAtRoute(RoutePathEnum.PREFERENCES, <Preferences />);

    // O cliente tenta a requisição de novo antes de desistir.
    expect(
      await screen.findByText(C.PREFERENCES_MESSAGES.loadFailed, undefined, {
        timeout: RETRY_WINDOW_MS,
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('alert')).toHaveLength(1);
    expect(screen.getByText(THEME_LABEL)).toBeInTheDocument();
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
  });
});
