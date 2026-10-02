import { http, HttpResponse } from 'msw';

import { server } from '@app/mocks/server';
import { AppProviders } from '@app/providers/AppProviders';
import { tokenStorage } from '@app/services/auth/tokenStorage';
import { PROFILE } from '@app/test/profile';
import { act, renderHook, waitFor } from '@app/test/testing-library';
import { tokenWithName } from '@app/test/token';

import { useContactGate } from './useContactGate';
import { useLacksContact } from './useLacksContact';
import { useProfile } from './useProfile';

const PROFILE_URL = 'https://api.fateconnect.test/users/me';

describe('useContactGate', () => {
  beforeEach(() => {
    tokenStorage.save(tokenWithName('Maria da Silva'));
  });

  it('should let whoever has a contact through to the form', async () => {
    let requests = 0;
    server.use(
      http.get(PROFILE_URL, () => {
        requests += 1;

        return HttpResponse.json(PROFILE);
      }),
    );
    const publish = vi.fn();
    const { result } = renderHook(() => useContactGate(), { wrapper: AppProviders });
    await waitFor(() => expect(requests).toBe(1));

    act(() => result.current.guard(publish));

    expect(publish).toHaveBeenCalledOnce();
    expect(result.current.contactDialogOpen).toBe(false);
  });

  it('should open the notice instead of the form for whoever has no contact', async () => {
    server.use(
      http.get(PROFILE_URL, () =>
        HttpResponse.json({ ...PROFILE, phone: null, contactEmail: null }),
      ),
    );
    const publish = vi.fn();
    const { result } = renderHook(
      () => ({ gate: useContactGate(), lacksContact: useLacksContact() }),
      { wrapper: AppProviders },
    );
    await waitFor(() => expect(result.current.lacksContact).toBe(true));

    act(() => result.current.gate.guard(publish));

    expect(result.current.gate.contactDialogOpen).toBe(true);
    expect(publish).not.toHaveBeenCalled();
  });

  it('should let the form open as soon as the profile saves a contact, with no new login', async () => {
    let requests = 0;
    server.use(
      http.get(PROFILE_URL, () => {
        requests += 1;

        return HttpResponse.json({ ...PROFILE, phone: null, contactEmail: null });
      }),
    );
    const publish = vi.fn();
    const { result } = renderHook(
      () => ({ gate: useContactGate(), profile: useProfile(), lacksContact: useLacksContact() }),
      { wrapper: AppProviders },
    );
    await waitFor(() => expect(result.current.lacksContact).toBe(true));
    act(() => result.current.gate.guard(publish));
    expect(publish).not.toHaveBeenCalled();

    // É o que a tela de perfil faz ao salvar.
    act(() => result.current.profile.replaceProfile(PROFILE));
    await waitFor(() => expect(result.current.lacksContact).toBe(false));
    act(() => result.current.gate.guard(publish));

    expect(publish).toHaveBeenCalledOnce();
    expect(requests).toBe(1);
  });

  it('should open the notice and fetch the profile again when the api asks for a contact', async () => {
    let requests = 0;
    server.use(
      http.get(PROFILE_URL, () => {
        requests += 1;

        return HttpResponse.json(PROFILE);
      }),
    );
    const { result } = renderHook(() => useContactGate(), { wrapper: AppProviders });
    await waitFor(() => expect(requests).toBe(1));

    act(() => result.current.showContactRequired());

    expect(result.current.contactDialogOpen).toBe(true);
    await waitFor(() => expect(requests).toBe(2));

    act(() => result.current.closeContactDialog());
    expect(result.current.contactDialogOpen).toBe(false);
  });
});
