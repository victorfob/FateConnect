import { createMemoryRouter, RouterProvider } from 'react-router';
import { http, HttpResponse } from 'msw';

import { server } from '@app/mocks/server';
import { RoutePathEnum } from '@app/routes/paths';
import { routeConfig } from '@app/routes/routeConfig';
import { tokenStorage } from '@app/services/auth/tokenStorage';
import { render, screen, waitFor } from '@app/test/testing-library';

import { SESSION_EXPIRED_TITLE } from '../SessionExpiredScreen/constants';

const RIDES_URL = 'https://api.fateconnect.test/Rides';

function renderRides() {
  render(
    <RouterProvider
      router={createMemoryRouter(routeConfig, { initialEntries: [RoutePathEnum.RIDES] })}
    />,
  );
}

describe('SessionExpiryGate', () => {
  afterEach(() => tokenStorage.clear());

  it('should show the expired session screen when a request with a token is refused', async () => {
    tokenStorage.save('token-vencido');
    server.use(http.get(RIDES_URL, () => new HttpResponse(null, { status: 401 })));

    renderRides();

    expect(await screen.findByRole('heading', { name: SESSION_EXPIRED_TITLE })).toBeInTheDocument();
  });

  it('should clear the stored session so the next request goes out without a token', async () => {
    tokenStorage.save('token-vencido');
    server.use(http.get(RIDES_URL, () => new HttpResponse(null, { status: 401 })));

    renderRides();
    await screen.findByRole('heading', { name: SESSION_EXPIRED_TITLE });

    expect(tokenStorage.getToken()).toBeNull();
  });

  // Sem token não houve sessão: é credencial recusada, que o login trata sozinho.
  it('should leave the screen alone when the refused request carried no token', async () => {
    let refused = 0;
    server.use(
      http.get(RIDES_URL, () => {
        refused += 1;

        return new HttpResponse(null, { status: 401 });
      }),
    );

    renderRides();

    // Esperar a recusa chegar é o que dá valor à asserção seguinte: sem isto o
    // teste conclui antes de o interceptor rodar e passa mesmo sem a guarda.
    await waitFor(() => expect(refused).toBeGreaterThan(0));
    expect(screen.queryByRole('heading', { name: SESSION_EXPIRED_TITLE })).not.toBeInTheDocument();
  });
});
