import { StrictMode } from 'react';
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router';
import { http, HttpResponse } from 'msw';

import { SIGN_IN_LABEL } from '@app/components/SignInButton/constants';
import { server } from '@app/mocks/server';
import { LandingSectionEnum, RoutePathEnum } from '@app/routes/paths';
import { render, screen, userEvent, waitFor } from '@app/test/testing-library';
import { EMAIL_LINK_EMAIL_PARAM, EMAIL_LINK_TOKEN_PARAM } from '@app/utils/emailLink';
import { prefilledEmailOf } from '@app/utils/loginPrefill';

import * as C from './constants';
import { UnlockAccount } from '.';

const UNLOCK_URL = 'https://api.fateconnect.test/auth/unlock';
const BAD_REQUEST = 400;
const SERVER_ERROR = 500;
const EMAIL = 'aluno.teste@aluno.cps.sp.gov.br';

function LandingProbe() {
  const { hash, state } = useLocation();

  return <p>{`landing ${hash} ${prefilledEmailOf(state) ?? 'sem e-mail'}`}</p>;
}

function renderPage(search: string) {
  const router = createMemoryRouter(
    [
      { path: RoutePathEnum.UNLOCK_ACCOUNT, element: <UnlockAccount /> },
      { path: RoutePathEnum.LANDING, element: <LandingProbe /> },
    ],
    { initialEntries: [`${RoutePathEnum.UNLOCK_ACCOUNT}${search}`] },
  );
  render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}

function linkSearch(token: string) {
  return `?${EMAIL_LINK_TOKEN_PARAM}=${token}&${EMAIL_LINK_EMAIL_PARAM}=${encodeURIComponent(EMAIL)}`;
}

describe('UnlockAccount', () => {
  it('should unlock once with the link token and lead to the login with the email filled', async () => {
    const receivedBodies: unknown[] = [];
    server.use(
      http.post(UNLOCK_URL, async ({ request }) => {
        receivedBodies.push(await request.json());

        return new HttpResponse(null, { status: 204 });
      }),
    );
    renderPage(linkSearch('token-que-vale'));

    expect(
      await screen.findByRole('heading', { name: C.UNLOCKED_MESSAGE.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(C.UNLOCKED_MESSAGE.description)).toBeInTheDocument();
    // O StrictMode monta a tela duas vezes; o link só vale uma.
    expect(receivedBodies).toEqual([{ token: 'token-que-vale' }]);

    await userEvent.click(screen.getByRole('link', { name: SIGN_IN_LABEL }));

    expect(
      await screen.findByText(`landing #${LandingSectionEnum.LOGIN} ${EMAIL}`),
    ).toBeInTheDocument();
  });

  it('should show the loading state while the api answers', async () => {
    let respond: VoidFunction = () => {};
    const held = new Promise<void>((resolve) => {
      respond = resolve;
    });
    server.use(
      http.post(UNLOCK_URL, async () => {
        await held;

        return new HttpResponse(null, { status: 204 });
      }),
    );
    renderPage(linkSearch('token-lento'));

    expect(screen.getByRole('heading', { name: C.LOADING_TITLE })).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: C.LOADING_TITLE })).toBeInTheDocument();

    respond();
    expect(
      await screen.findByRole('heading', { name: C.UNLOCKED_MESSAGE.title }),
    ).toBeInTheDocument();
  });

  it('should say the account is already unlocked when the link expired or was used', async () => {
    server.use(http.post(UNLOCK_URL, () => new HttpResponse(null, { status: BAD_REQUEST })));
    renderPage(linkSearch('token-usado'));

    expect(
      await screen.findByRole('heading', { name: C.EXPIRED_LINK_MESSAGE.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(C.EXPIRED_LINK_MESSAGE.description)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: SIGN_IN_LABEL })).toBeInTheDocument();
    // Quem avisa é a tela: a falha esperada não vira notificação.
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('should treat a link without token as expired, without calling the api', async () => {
    let called = false;
    server.use(
      http.post(UNLOCK_URL, () => {
        called = true;

        return new HttpResponse(null, { status: 204 });
      }),
    );
    renderPage(`?${EMAIL_LINK_EMAIL_PARAM}=${encodeURIComponent(EMAIL)}`);

    expect(
      await screen.findByRole('heading', { name: C.EXPIRED_LINK_MESSAGE.title }),
    ).toBeInTheDocument();
    expect(called).toBe(false);
  });

  it('should offer to try again when the unlock fails for another reason', async () => {
    let attempts = 0;
    server.use(
      http.post(UNLOCK_URL, () => {
        attempts += 1;
        if (attempts === 1) return new HttpResponse(null, { status: SERVER_ERROR });

        return new HttpResponse(null, { status: 204 });
      }),
    );
    renderPage(linkSearch('token-instavel'));

    expect(
      await screen.findByRole('heading', { name: C.UNLOCK_FAILED_MESSAGE.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(C.UNLOCK_FAILED_MESSAGE.description)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: C.RETRY_LABEL }));

    expect(
      await screen.findByRole('heading', { name: C.UNLOCKED_MESSAGE.title }),
    ).toBeInTheDocument();
    await waitFor(() => expect(attempts).toBe(2));
  });
});
