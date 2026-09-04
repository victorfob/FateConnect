import { http, HttpResponse } from 'msw';

import { server } from '@app/mocks/server';
import { tokenStorage } from '@app/services/auth/tokenStorage';
import { render, screen, userEvent } from '@app/test/testing-library';
import { tokenWithName } from '@app/test/token';

import { SIGN_OUT_LABEL } from './constants';
import { DrawerSignOut } from '.';

const LOGOUT_URL = 'https://api.fateconnect.test/auth/logout';
const NO_CONTENT = 204;
const SERVER_ERROR = 500;

describe('DrawerSignOut', () => {
  beforeEach(() => {
    server.use(http.post(LOGOUT_URL, () => new HttpResponse(null, { status: NO_CONTENT })));
    tokenStorage.save(tokenWithName('Maria da Silva'));
  });

  it('should end the session as soon as it is used', async () => {
    render(<DrawerSignOut />);

    await userEvent.click(screen.getByRole('button', { name: SIGN_OUT_LABEL }));

    expect(tokenStorage.getToken()).toBeNull();
  });

  it('should end the session even when the logout request fails', async () => {
    server.use(http.post(LOGOUT_URL, () => new HttpResponse(null, { status: SERVER_ERROR })));
    render(<DrawerSignOut />);

    await userEvent.click(screen.getByRole('button', { name: SIGN_OUT_LABEL }));

    expect(tokenStorage.getToken()).toBeNull();
  });
});
