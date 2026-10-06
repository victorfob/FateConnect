import { http, HttpResponse } from 'msw';

import { server } from '@app/mocks/server';

import { getPreferences, updatePreferences } from './preferencesService';
import type { Preferences } from './preferencesTypes';

const PREFERENCES_URL = 'https://api.fateconnect.test/users/me/preferences';

const NO_CONTENT = 204;

const PREFERENCES: Preferences = { receiveEmails: false, receiveNotifications: true };

describe('preferencesService', () => {
  it('should read the preferences of whoever is logged in', async () => {
    server.use(http.get(PREFERENCES_URL, () => HttpResponse.json(PREFERENCES)));

    await expect(getPreferences()).resolves.toEqual(PREFERENCES);
  });

  it('should send only the preference that changed', async () => {
    let body: unknown = null;
    server.use(
      http.patch(PREFERENCES_URL, async ({ request }) => {
        body = await request.json();

        return new HttpResponse(null, { status: NO_CONTENT });
      }),
    );

    await updatePreferences({ receiveEmails: true });

    expect(body).toEqual({ receiveEmails: true });
  });
});
