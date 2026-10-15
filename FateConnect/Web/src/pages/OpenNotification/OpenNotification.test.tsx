import { createMemoryRouter, RouterProvider } from 'react-router';
import { http, HttpResponse } from 'msw';

import { SignInFirstRoute } from '@app/components/SignInFirstRoute';
import { VisitorRoute } from '@app/components/VisitorRoute';
import { IN_APP_NOTIFICATION_TEXTS } from '@app/constants/inAppNotifications';
import { server } from '@app/mocks/server';
import { LandingLoginCard } from '@app/pages/Home/components/LandingLoginCard';
import { SUBMIT_LABEL } from '@app/pages/Home/components/LandingLoginCard/constants';
import { RoutePathEnum } from '@app/routes/paths';
import { tokenStorage } from '@app/services/auth/tokenStorage';
import { render, screen, userEvent, waitFor } from '@app/test/testing-library';
import { tokenWithName } from '@app/test/token';
import { problemResponse } from '@app/test/utils/problemResponse';

import { OpenNotification } from '.';

const API = 'https://api.fateconnect.test';
const RIDE_ID = 'carona-42';
const NO_CONTENT = 204;
const NOT_FOUND = 404;
const SERVER_ERROR = 500;

function recordReads() {
  const read: string[] = [];
  server.use(
    http.patch(`${API}/inappnotifications/:id/read`, ({ params }) => {
      read.push(String(params.id));

      return new HttpResponse(null, { status: NO_CONTENT });
    }),
  );

  return read;
}

function renderOpening(search: string) {
  const router = createMemoryRouter(
    [
      {
        element: <SignInFirstRoute />,
        children: [{ path: RoutePathEnum.OPEN_NOTIFICATION, element: <OpenNotification /> }],
      },
      {
        element: <VisitorRoute />,
        children: [{ path: RoutePathEnum.LANDING, element: <LandingLoginCard /> }],
      },
      { path: RoutePathEnum.REPORTS, element: <div>denúncias</div> },
      { path: RoutePathEnum.RIDES, element: <div>caronas</div> },
      { path: RoutePathEnum.NOTIFICATIONS, element: <div>central</div> },
    ],
    { initialEntries: [`${RoutePathEnum.OPEN_NOTIFICATION}?${search}`] },
  );
  render(<RouterProvider router={router} />);

  return router;
}

describe('OpenNotification', () => {
  it('should mark the notification as read and lead where the bell leads', async () => {
    tokenStorage.save(tokenWithName('Maria da Silva'));
    const read = recordReads();
    server.use(
      http.get(`${API}/rides/${RIDE_ID}`, () =>
        HttpResponse.json({ destination: 'Jardim Toledo' }),
      ),
    );

    const router = renderOpening(`aviso=7&tipo=caronas&referencia=${RIDE_ID}`);

    expect(await screen.findByText('caronas')).toBeInTheDocument();
    expect(router.state.location.search).toBe('?busca=Jardim+Toledo');
    expect(read).toEqual(['7']);
    // Substitui a entrada: voltar não reabre o aviso.
    expect(router.state.historyAction).toBe('REPLACE');
  });

  it('should go through the login first and then reach the destination', async () => {
    const read = recordReads();
    server.use(
      http.post(`${API}/auth/login`, () =>
        HttpResponse.json({ token: tokenWithName('Maria da Silva') }),
      ),
    );
    renderOpening('aviso=9&tipo=denuncias');

    await userEvent.type(await screen.findByLabelText(/E-mail/), 'aluno.teste@aluno.cps.sp.gov.br');
    await userEvent.type(screen.getByLabelText(/Senha/), 'segredo123');
    await userEvent.click(screen.getByRole('button', { name: SUBMIT_LABEL }));

    expect(await screen.findByText('denúncias')).toBeInTheDocument();
    expect(read).toEqual(['9']);
  });

  it('should still lead to the destination when the notification belongs to another account', async () => {
    tokenStorage.save(tokenWithName('Maria da Silva'));
    server.use(http.patch(`${API}/inappnotifications/:id/read`, () => problemResponse(NOT_FOUND)));

    renderOpening('aviso=11&tipo=denuncias');

    expect(await screen.findByText('denúncias')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('should warn and open the notification center when the ride no longer exists', async () => {
    tokenStorage.save(tokenWithName('Maria da Silva'));
    recordReads();
    server.use(http.get(`${API}/rides/${RIDE_ID}`, () => problemResponse(NOT_FOUND)));

    renderOpening(`aviso=7&tipo=caronas&referencia=${RIDE_ID}`);

    expect(await screen.findByText('central')).toBeInTheDocument();
    expect(await screen.findByText(IN_APP_NOTIFICATION_TEXTS.rideRemoved)).toBeInTheDocument();
  });

  it('should warn once and open the notification center when the destination fails', async () => {
    tokenStorage.save(tokenWithName('Maria da Silva'));
    recordReads();
    server.use(
      http.get(`${API}/rides/${RIDE_ID}`, () => new HttpResponse(null, { status: SERVER_ERROR })),
    );

    renderOpening(`aviso=7&tipo=caronas&referencia=${RIDE_ID}`);

    expect(await screen.findByText('central')).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText(IN_APP_NOTIFICATION_TEXTS.openFailed)).toBeInTheDocument(),
    );
    expect(screen.getAllByRole('alert')).toHaveLength(1);
  });

  it.each(['aviso=7', 'aviso=0&tipo=caronas', 'aviso=abc&tipo=caronas', 'aviso=7&tipo=eventos'])(
    'should open the notification center for the address %s, which names no notification',
    async (search) => {
      tokenStorage.save(tokenWithName('Maria da Silva'));

      renderOpening(search);

      expect(await screen.findByText('central')).toBeInTheDocument();
    },
  );
});
