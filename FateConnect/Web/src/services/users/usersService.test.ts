import { http, HttpResponse } from 'msw';

import { server } from '@app/mocks/server';

import { ProfileTypeEnum } from '../auth/types';
import { AccountStatusEnum, type User } from './types';
import {
  changeUserProfile,
  changeUserStatus,
  getUser,
  listUsers,
  updateUser,
} from './usersService';

const USERS_URL = 'https://api.fateconnect.test/users';

const USER_ID = 7;

const USER: User = {
  id: USER_ID,
  fatecEmail: 'maria.silva@aluno.cps.sp.gov.br',
  fullName: 'Maria da Silva',
  birthDate: '2000-01-01T00:00:00',
  gender: 'Female',
  phone: '15999998888',
  contactEmail: 'maria@exemplo.test',
  neighborhood: null,
  imageUrl: null,
  thumbnailUrl: null,
  profileType: ProfileTypeEnum.OPERATOR,
  status: AccountStatusEnum.ACTIVE,
  createdAt: '2026-09-01T12:00:00',
};

type Received = { path: string; body: unknown };

function patchServing(path: string, received: Received[]) {
  server.use(
    http.patch(`${USERS_URL}${path}`, async ({ request }) => {
      received.push({ path: new URL(request.url).pathname, body: await request.json() });

      return HttpResponse.json(USER);
    }),
  );
}

describe('usersService', () => {
  it('should send the filter as the query the api reads', async () => {
    let asked: string | null = null;
    server.use(
      http.get(USERS_URL, ({ request }) => {
        asked = request.url;

        return HttpResponse.json({ items: [], page: 1, pageSize: 10, total: 0, totalPages: 0 });
      }),
    );

    await listUsers({
      search: 'maria',
      status: AccountStatusEnum.BANNED,
      profileType: ProfileTypeEnum.ADMINISTRATOR,
      page: 2,
    });

    expect(asked).toContain('search=maria');
    expect(asked).toContain('status=Banned');
    expect(asked).toContain('profileType=Administrator');
    expect(asked).toContain('page=2');
  });

  it('should refuse an answer that is not a page', async () => {
    server.use(http.get(USERS_URL, () => HttpResponse.text('<!doctype html>')));

    await expect(listUsers()).rejects.toThrow();
  });

  it('should read one user by its id', async () => {
    server.use(http.get(`${USERS_URL}/${USER_ID}`, () => HttpResponse.json(USER)));

    expect(await getUser(USER_ID)).toEqual(USER);
  });

  it('should send each change to the route that owns it', async () => {
    const received: Received[] = [];
    patchServing(`/${USER_ID}`, received);
    patchServing(`/${USER_ID}/profile`, received);
    patchServing(`/${USER_ID}/status`, received);

    await updateUser(USER_ID, {
      fullName: 'Maria da Silva',
      fatecEmail: 'maria.silva@aluno.cps.sp.gov.br',
      phone: '15999998888',
      contactEmail: 'maria@exemplo.test',
    });
    await changeUserProfile(USER_ID, ProfileTypeEnum.ADMINISTRATOR);
    await changeUserStatus(USER_ID, AccountStatusEnum.BANNED);

    expect(received).toEqual([
      {
        path: `/users/${USER_ID}`,
        body: {
          fullName: 'Maria da Silva',
          fatecEmail: 'maria.silva@aluno.cps.sp.gov.br',
          phone: '15999998888',
          contactEmail: 'maria@exemplo.test',
        },
      },
      { path: `/users/${USER_ID}/profile`, body: { profileType: ProfileTypeEnum.ADMINISTRATOR } },
      { path: `/users/${USER_ID}/status`, body: { status: AccountStatusEnum.BANNED } },
    ]);
  });
});
