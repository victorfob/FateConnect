import { createMemoryRouter, RouterProvider } from 'react-router';
import { http, HttpResponse } from 'msw';

import { server } from '@app/mocks/server';
import { RoutePathEnum } from '@app/routes/paths';
import { routeConfig } from '@app/routes/routeConfig';
import { tokenStorage } from '@app/services/auth/tokenStorage';
import { render, screen, userEvent, waitFor } from '@app/test/testing-library';
import { tokenWithName } from '@app/test/token';

import { SESSION_EXPIRED_TITLE } from '../SessionExpiredScreen/constants';

const SESSION_URL = 'https://api.fateconnect.test/auth/session';
const RIDES_URL = 'https://api.fateconnect.test/rides';
const LOGIN_URL = 'https://api.fateconnect.test/auth/login';
const UNAUTHORIZED = 401;

function renderAt(path: string) {
  const router = createMemoryRouter(routeConfig, { initialEntries: [path] });
  render(<RouterProvider router={router} />);

  return router;
}

describe('AppRoute', () => {
  afterEach(() => tokenStorage.clear());

  it('should send whoever has no session back to the landing page', async () => {
    const router = renderAt(RoutePathEnum.MENU);

    await waitFor(() => expect(router.state.location.pathname).toBe(RoutePathEnum.LANDING));
  });

  it('should warn whoever arrives with a session the api no longer accepts', async () => {
    tokenStorage.save(tokenWithName('Maria da Silva'));
    server.use(http.get(SESSION_URL, () => new HttpResponse(null, { status: UNAUTHORIZED })));

    renderAt(RoutePathEnum.MENU);

    expect(await screen.findByRole('heading', { name: SESSION_EXPIRED_TITLE })).toBeInTheDocument();
  });

  it('should warn when the session expires while the screen is open', async () => {
    tokenStorage.save(tokenWithName('Maria da Silva'));
    server.use(http.get(RIDES_URL, () => new HttpResponse(null, { status: UNAUTHORIZED })));

    renderAt(RoutePathEnum.RIDES);

    expect(await screen.findByRole('heading', { name: SESSION_EXPIRED_TITLE })).toBeInTheDocument();
    await waitFor(() => expect(tokenStorage.getToken()).toBeNull());
  });

  it('should leave the screen alone when the refused request carried no token', async () => {
    // Sem token não se alcança rota interna: o 401 sem sessão só acontece no
    // login, e é credencial recusada, não expiração.
    let refused = 0;
    server.use(
      http.post(LOGIN_URL, () => {
        refused += 1;

        return new HttpResponse(null, { status: UNAUTHORIZED });
      }),
    );
    renderAt(RoutePathEnum.LANDING);

    await userEvent.type(screen.getByLabelText(/E-mail/), 'aluno.teste@aluno.cps.sp.gov.br');
    // Enter no campo envia o formulário: a landing tem dois botões "Entrar".
    await userEvent.type(screen.getByLabelText(/Senha/), 'segredo-errado{Enter}');

    await waitFor(() => expect(refused).toBeGreaterThan(0));
    expect(screen.queryByRole('heading', { name: SESSION_EXPIRED_TITLE })).not.toBeInTheDocument();
  });
});
