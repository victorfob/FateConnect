import { http, HttpResponse } from 'msw';

import { server } from '@app/mocks/server';
import { AppProviders } from '@app/providers/AppProviders';
import { tokenStorage } from '@app/services/auth/tokenStorage';
import { PROFILE } from '@app/test/profile';
import { renderHook, waitFor } from '@app/test/testing-library';
import { tokenWithName } from '@app/test/token';

import { useLacksContact } from './useLacksContact';

const PROFILE_URL = 'https://api.fateconnect.test/users/me';

function profileAnswering(contact: { phone: string | null; contactEmail: string | null }) {
  server.use(http.get(PROFILE_URL, () => HttpResponse.json({ ...PROFILE, ...contact })));
}

describe('useLacksContact', () => {
  beforeEach(() => {
    tokenStorage.save(tokenWithName('Maria da Silva'));
  });

  it('should answer the lack once the profile arrives without contact', async () => {
    profileAnswering({ phone: null, contactEmail: null });

    const { result } = renderHook(() => useLacksContact(), { wrapper: AppProviders });

    expect(result.current).toBe(false);
    await waitFor(() => expect(result.current).toBe(true));
  });

  it('should count half a contact as no contact', async () => {
    profileAnswering({ phone: '15990000001', contactEmail: null });

    const { result } = renderHook(() => useLacksContact(), { wrapper: AppProviders });

    await waitFor(() => expect(result.current).toBe(true));
  });

  it('should not bar whoever has both', async () => {
    const requests: string[] = [];
    server.use(
      http.get(PROFILE_URL, () => {
        requests.push(PROFILE_URL);

        return HttpResponse.json(PROFILE);
      }),
    );

    const { result } = renderHook(() => useLacksContact(), { wrapper: AppProviders });

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(result.current).toBe(false);
  });
});
