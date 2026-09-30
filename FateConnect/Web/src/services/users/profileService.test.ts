import { http, HttpResponse } from 'msw';

import { server } from '@app/mocks/server';
import { PROFILE } from '@app/test/profile';

import { tokenStorage } from '../auth/tokenStorage';
import { apiClient } from '../httpClient';
import {
  changePassword,
  deactivateAccount,
  getProfile,
  removeProfileImage,
  updateProfile,
} from './profileService';
import type { ProfileInput } from './profileTypes';

const PROFILE_URL = 'https://api.fateconnect.test/users/me';

const NO_CONTENT = 204;

const PROFILE_INPUT: ProfileInput = {
  fullName: 'Mariana Rocha',
  birthDate: '2001-03-14T00:00:00Z',
  gender: 'Female',
  phone: '11987654321',
  contactEmail: 'mariana@example.com',
  neighborhood: '',
  image: null,
};

const SENT_FIELDS = {
  FullName: 'Mariana Rocha',
  BirthDate: '2001-03-14T00:00:00Z',
  Gender: 'Female',
  Phone: '11987654321',
  ContactEmail: 'mariana@example.com',
  Neighborhood: '',
};

/** A API recebe `[FromForm]`, e ler o corpo como formulário faz o stub reprovar um JSON. */
async function fieldsOf(request: Request): Promise<Record<string, FormDataEntryValue>> {
  return Object.fromEntries(await request.formData());
}

describe('profileService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    tokenStorage.clear();
  });

  it('should read the profile of whoever is logged in', async () => {
    server.use(http.get(PROFILE_URL, () => HttpResponse.json(PROFILE)));

    await expect(getProfile()).resolves.toEqual(PROFILE);
  });

  it('should send every field, the empty neighborhood included, and no image field without a photo', async () => {
    let fields: Record<string, FormDataEntryValue> | null = null;
    server.use(
      http.patch(PROFILE_URL, async ({ request }) => {
        fields = await fieldsOf(request);

        return HttpResponse.json(PROFILE);
      }),
    );

    const saved = await updateProfile(PROFILE_INPUT);

    expect(fields).toEqual(SENT_FIELDS);
    expect(saved).toEqual(PROFILE);
  });

  /** O `File` não atravessa o interceptador do stub no jsdom, então se afirma o corpo entregue ao cliente. */
  it('should put the chosen photo in the same body as the fields', async () => {
    const photo = new File(['foto'], 'perfil.png', { type: 'image/png' });
    const patch = vi.spyOn(apiClient, 'patch').mockResolvedValue({ data: PROFILE });

    await updateProfile({ ...PROFILE_INPUT, image: photo });

    const [path, body] = patch.mock.calls[0]!;
    expect(path).toBe('/users/me');
    expect(Object.fromEntries(body as FormData)).toEqual({ ...SENT_FIELDS, Image: photo });
  });

  it('should remove the stored photo', async () => {
    let removed = false;
    server.use(
      http.delete(`${PROFILE_URL}/image`, () => {
        removed = true;

        return new HttpResponse(null, { status: NO_CONTENT });
      }),
    );

    await removeProfileImage();

    expect(removed).toBe(true);
  });

  it('should send both passwords and keep the session with the token the change returns', async () => {
    let body: unknown = null;
    tokenStorage.save('antigo');
    server.use(
      http.patch(`${PROFILE_URL}/password`, async ({ request }) => {
        body = await request.json();

        return HttpResponse.json({ token: 'novo' });
      }),
    );

    await changePassword({ currentPassword: 'SenhaAtual1', newPassword: 'SenhaNova12' });

    expect(body).toEqual({ currentPassword: 'SenhaAtual1', newPassword: 'SenhaNova12' });
    expect(tokenStorage.getToken()).toBe('novo');
  });

  it('should end the local session once the account is deactivated', async () => {
    tokenStorage.save('abc');
    server.use(
      http.post(`${PROFILE_URL}/deactivate`, () => new HttpResponse(null, { status: NO_CONTENT })),
    );

    await deactivateAccount();

    expect(tokenStorage.getToken()).toBeNull();
  });
});
