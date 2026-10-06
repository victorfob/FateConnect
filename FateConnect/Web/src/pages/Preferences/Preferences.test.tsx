import { http, HttpResponse } from 'msw';

import { BACK_TO_MENU_LABEL } from '@app/components/BackToMenu/constants';
import { REGISTER_CONTACTS_LABEL } from '@app/components/ContactRequiredDialog/constants';
import { SAVE_BAR_TEXTS } from '@app/components/SaveBar/constants';
import { THEME_LABEL, THEME_OPTIONS, triggerLabel } from '@app/components/ThemeMenu/constants';
import { UNSAVED_CHANGES } from '@app/components/UnsavedChangesDialog/constants';
import { server } from '@app/mocks/server';
import { RoutePathEnum } from '@app/routes/paths';
import { tokenStorage } from '@app/services/auth/tokenStorage';
import type { Preferences as StoredPreferences } from '@app/services/users/preferencesTypes';
import { PROFILE } from '@app/test/profile';
import { cleanup, screen, userEvent, waitFor, within } from '@app/test/testing-library';
import { tokenWithName } from '@app/test/token';
import { renderAtRoute } from '@app/test/utils/renderAtRoute';

import { MISSING_CONTACT_NOTE } from './components/CommunicationsForm/components/MissingContactNote/constants';
import {
  CHANNEL_TEXTS,
  COMMUNICATIONS_SECTION_TITLE,
  COMMUNICATIONS_SUBTITLE,
  PREFERENCES_UNSAVED_CHANGES_MESSAGE,
} from './components/CommunicationsForm/constants';
import * as C from './constants';
import { Preferences } from '.';

const PREFERENCES_URL = 'https://api.fateconnect.test/users/me/preferences';
const PROFILE_URL = 'https://api.fateconnect.test/users/me';

const NO_CONTENT = 204;
const SERVER_ERROR = 500;

/** Cobre a tentativa inicial, os 2s de espera e a repetição. */
const RETRY_WINDOW_MS = 5000;

const STORED: StoredPreferences = { receiveEmails: false, receiveNotifications: true };

const [AUTOMATIC = '', , DARK = ''] = THEME_OPTIONS.map((option) => option.label);

function servePreferences(preferences = STORED) {
  server.use(http.get(PREFERENCES_URL, () => HttpResponse.json(preferences)));
}

function serveProfileWithoutContact() {
  server.use(
    http.get(PROFILE_URL, () => HttpResponse.json({ ...PROFILE, phone: null, contactEmail: null })),
  );
}

async function renderPreferences(preferences = STORED) {
  servePreferences(preferences);
  const router = renderAtRoute(RoutePathEnum.PREFERENCES, <Preferences />);
  await screen.findByRole('region', { name: COMMUNICATIONS_SECTION_TITLE });

  return router;
}

const appSwitch = () => screen.getByRole('switch', { name: CHANNEL_TEXTS.app.label });
const emailSwitch = () => screen.getByRole('switch', { name: CHANNEL_TEXTS.email.label });
const saveButton = () => screen.getByRole('button', { name: SAVE_BAR_TEXTS.save });

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

  it('should keep the theme alone in the appearance section', async () => {
    await renderPreferences();

    const appearance = screen.getByRole('region', { name: C.APPEARANCE_SECTION_TITLE });

    expect(within(appearance).getByText(THEME_LABEL)).toBeInTheDocument();
    expect(within(appearance).getByText(C.THEME_DESCRIPTION)).toBeInTheDocument();
    expect(within(appearance).queryByRole('switch')).not.toBeInTheDocument();
  });

  it('should apply the chosen theme at once, without the save bar', async () => {
    await renderPreferences();
    const lightBackground = documentBackground();

    await chooseTheme(AUTOMATIC, DARK);

    expect(themeTrigger(DARK)).toBeInTheDocument();
    expect(documentBackground()).not.toBe(lightBackground);
    expect(saveButton()).toBeDisabled();
  });

  it('should keep the chosen theme when the screen is mounted again', async () => {
    await renderPreferences();
    await chooseTheme(AUTOMATIC, DARK);

    cleanup();
    await renderPreferences();

    expect(themeTrigger(DARK)).toBeInTheDocument();
  });

  it('should open each channel with the stored choice and explain what both deliver', async () => {
    await renderPreferences();

    const communications = screen.getByRole('region', { name: COMMUNICATIONS_SECTION_TITLE });

    expect(within(communications).getByText(COMMUNICATIONS_SUBTITLE)).toBeInTheDocument();
    expect(appSwitch()).toBeChecked();
    expect(appSwitch()).toHaveAccessibleDescription(CHANNEL_TEXTS.app.description);
    expect(emailSwitch()).not.toBeChecked();
    expect(emailSwitch()).toHaveAccessibleDescription(CHANNEL_TEXTS.email.description);
  });

  it('should save only the channel that changed, through the save bar', async () => {
    let body: unknown = null;
    server.use(
      http.patch(PREFERENCES_URL, async ({ request }) => {
        body = await request.json();

        return new HttpResponse(null, { status: NO_CONTENT });
      }),
    );
    await renderPreferences();

    expect(saveButton()).toBeDisabled();

    await userEvent.click(emailSwitch());
    await userEvent.click(saveButton());

    expect(await screen.findByText(C.PREFERENCES_MESSAGES.saved)).toBeInTheDocument();
    expect(body).toEqual({ receiveEmails: true });
    expect(emailSwitch()).toBeChecked();
    expect(saveButton()).toBeDisabled();
  });

  it('should let both channels go off together', async () => {
    let body: unknown = null;
    server.use(
      http.patch(PREFERENCES_URL, async ({ request }) => {
        body = await request.json();

        return new HttpResponse(null, { status: NO_CONTENT });
      }),
    );
    await renderPreferences({ receiveEmails: true, receiveNotifications: true });

    await userEvent.click(appSwitch());
    await userEvent.click(emailSwitch());
    await userEvent.click(saveButton());

    expect(await screen.findByText(C.PREFERENCES_MESSAGES.saved)).toBeInTheDocument();
    expect(body).toEqual({ receiveEmails: false, receiveNotifications: false });
  });

  it('should keep the change pending and warn once when the save fails', async () => {
    server.use(http.patch(PREFERENCES_URL, () => new HttpResponse(null, { status: SERVER_ERROR })));
    await renderPreferences();

    await userEvent.click(appSwitch());
    await userEvent.click(saveButton());

    expect(await screen.findByText(C.PREFERENCES_MESSAGES.saveFailed)).toBeInTheDocument();
    expect(screen.getAllByRole('alert')).toHaveLength(1);
    expect(appSwitch()).not.toBeChecked();
    expect(saveButton()).toBeEnabled();
  });

  it('should return to the stored choice when the change is discarded', async () => {
    await renderPreferences();

    await userEvent.click(appSwitch());
    await userEvent.click(screen.getByRole('button', { name: SAVE_BAR_TEXTS.discard }));

    expect(appSwitch()).toBeChecked();
    expect(saveButton()).toBeDisabled();
  });

  it('should ask before leaving with a pending change, and stay when the leave is canceled', async () => {
    const router = await renderPreferences();
    await userEvent.click(appSwitch());

    await userEvent.click(screen.getByRole('link', { name: BACK_TO_MENU_LABEL }));
    const dialog = screen.getByRole('dialog', { name: UNSAVED_CHANGES.title });

    expect(within(dialog).getByText(PREFERENCES_UNSAVED_CHANGES_MESSAGE)).toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole('button', { name: UNSAVED_CHANGES.cancel }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(router.state.location.pathname).toBe(RoutePathEnum.PREFERENCES);
    expect(appSwitch()).not.toBeChecked();
  });

  it('should lock the e-mail off and point to the contacts for whoever has none', async () => {
    serveProfileWithoutContact();
    await renderPreferences({ receiveEmails: true, receiveNotifications: true });

    const registerContacts = await screen.findByRole('link', { name: REGISTER_CONTACTS_LABEL });

    expect(emailSwitch()).toBeDisabled();
    expect(emailSwitch()).not.toBeChecked();
    expect(registerContacts).toHaveAttribute('href', RoutePathEnum.PROFILE);
    expect(registerContacts.closest('p')).toHaveTextContent(
      `${MISSING_CONTACT_NOTE} ${REGISTER_CONTACTS_LABEL}`,
    );
    expect(appSwitch()).toBeEnabled();
  });

  it('should keep the appearance and warn when the preferences do not load', async () => {
    server.use(http.get(PREFERENCES_URL, () => new HttpResponse(null, { status: SERVER_ERROR })));
    renderAtRoute(RoutePathEnum.PREFERENCES, <Preferences />);

    // O cliente tenta a requisição de novo antes de desistir.
    expect(
      await screen.findByText(C.PREFERENCES_MESSAGES.loadFailed, undefined, {
        timeout: RETRY_WINDOW_MS,
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('alert')).toHaveLength(1);
    expect(screen.getByRole('region', { name: C.APPEARANCE_SECTION_TITLE })).toBeInTheDocument();
    expect(
      screen.queryByRole('region', { name: COMMUNICATIONS_SECTION_TITLE }),
    ).not.toBeInTheDocument();
  });
});
