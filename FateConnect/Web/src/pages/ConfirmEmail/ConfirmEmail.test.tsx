import { StrictMode } from 'react';
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router';
import { http, HttpResponse } from 'msw';

import { RESEND_LABEL } from '@app/components/ResendLinkButton/constants';
import { SIGN_IN_LABEL } from '@app/components/SignInButton/constants';
import { BANNED_ACCOUNT_MESSAGE } from '@app/constants/bannedAccount';
import { CONFIRMATION_LINK_RESENT } from '@app/constants/emailLink';
import { server } from '@app/mocks/server';
import { LandingSectionEnum, RoutePathEnum } from '@app/routes/paths';
import { tokenStorage } from '@app/services/auth/tokenStorage';
import { render, screen, userEvent, waitFor } from '@app/test/testing-library';
import { EMAIL_LINK_EMAIL_PARAM, EMAIL_LINK_TOKEN_PARAM } from '@app/utils/emailLink';
import { prefilledEmailOf } from '@app/utils/loginPrefill';

import * as C from './constants';
import { ConfirmEmail } from '.';

const CONFIRM_EMAIL_URL = 'https://api.fateconnect.test/auth/confirm-email';
const RESEND_URL = 'https://api.fateconnect.test/auth/resend-confirmation-email';
const NO_CONTENT = 204;
const BAD_REQUEST = 400;
const FORBIDDEN = 403;
const SERVER_ERROR = 500;
const EMAIL = 'aluno.teste@aluno.cps.sp.gov.br';
const SESSION_TOKEN = 'sessao-da-confirmacao';

function LandingProbe() {
  const { hash, state } = useLocation();

  return <p>{`landing ${hash} ${prefilledEmailOf(state) ?? 'sem e-mail'}`}</p>;
}

function renderPage(search: string) {
  const router = createMemoryRouter(
    [
      { path: RoutePathEnum.CONFIRM_EMAIL, element: <ConfirmEmail /> },
      { path: RoutePathEnum.LANDING, element: <LandingProbe /> },
      { path: RoutePathEnum.MENU, element: <p>menu</p> },
    ],
    { initialEntries: [`${RoutePathEnum.CONFIRM_EMAIL}${search}`] },
  );
  render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );

  return router;
}

function linkSearch(token: string) {
  return `?${EMAIL_LINK_TOKEN_PARAM}=${token}&${EMAIL_LINK_EMAIL_PARAM}=${encodeURIComponent(EMAIL)}`;
}

function confirmationAnswering(status: number) {
  server.use(http.post(CONFIRM_EMAIL_URL, () => new HttpResponse(null, { status })));
}

describe('ConfirmEmail', () => {
  it('should confirm once with the link token, open the session and go to the menu', async () => {
    const receivedBodies: unknown[] = [];
    server.use(
      http.post(CONFIRM_EMAIL_URL, async ({ request }) => {
        receivedBodies.push(await request.json());

        return HttpResponse.json({ token: SESSION_TOKEN });
      }),
    );
    const router = renderPage(linkSearch('token-que-vale'));

    expect(await screen.findByText(C.CONFIRMED_MESSAGE)).toBeInTheDocument();
    await waitFor(() => expect(router.state.location.pathname).toBe(RoutePathEnum.MENU));
    expect(tokenStorage.getToken()).toBe(SESSION_TOKEN);
    // O StrictMode monta a tela duas vezes; o link só vale uma.
    expect(receivedBodies).toEqual([{ token: 'token-que-vale' }]);
  });

  it('should show the loading state while the api answers', async () => {
    let respond: VoidFunction = () => {};
    const held = new Promise<void>((resolve) => {
      respond = resolve;
    });
    server.use(
      http.post(CONFIRM_EMAIL_URL, async () => {
        await held;

        return HttpResponse.json({ token: SESSION_TOKEN });
      }),
    );
    renderPage(linkSearch('token-lento'));

    expect(screen.getByRole('heading', { name: C.LOADING_TITLE })).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: C.LOADING_TITLE })).toBeInTheDocument();

    respond();
    expect(await screen.findByText(C.CONFIRMED_MESSAGE)).toBeInTheDocument();
  });

  it('should offer a new link for the email of the link when it expired or was used', async () => {
    confirmationAnswering(BAD_REQUEST);
    const resentBodies: unknown[] = [];
    server.use(
      http.post(RESEND_URL, async ({ request }) => {
        resentBodies.push(await request.json());

        return new HttpResponse(null, { status: NO_CONTENT });
      }),
    );
    renderPage(linkSearch('token-vencido'));

    expect(
      await screen.findByRole('heading', { name: C.EXPIRED_LINK_MESSAGE.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(C.EXPIRED_LINK_MESSAGE.description)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: SIGN_IN_LABEL })).toBeInTheDocument();
    // Quem avisa é a tela: a falha esperada não vira notificação.
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: RESEND_LABEL }));

    expect(await screen.findByText(CONFIRMATION_LINK_RESENT)).toBeInTheDocument();
    expect(resentBodies).toEqual([{ fatecEmail: EMAIL }]);
    expect(tokenStorage.getToken()).toBeNull();
  });

  it('should lead to the login with the email filled', async () => {
    confirmationAnswering(BAD_REQUEST);
    renderPage(linkSearch('token-usado'));

    await userEvent.click(await screen.findByRole('link', { name: SIGN_IN_LABEL }));

    expect(
      await screen.findByText(`landing #${LandingSectionEnum.LOGIN} ${EMAIL}`),
    ).toBeInTheDocument();
  });

  it('should treat a link without token as expired, without calling the api', async () => {
    let called = false;
    server.use(
      http.post(CONFIRM_EMAIL_URL, () => {
        called = true;

        return HttpResponse.json({ token: SESSION_TOKEN });
      }),
    );
    renderPage(`?${EMAIL_LINK_EMAIL_PARAM}=${encodeURIComponent(EMAIL)}`);

    expect(
      await screen.findByRole('heading', { name: C.EXPIRED_LINK_MESSAGE.title }),
    ).toBeInTheDocument();
    expect(called).toBe(false);
  });

  // Sem o endereço não há para quem reenviar: sobra o caminho do login.
  it('should leave the resend out when the link carries no email', async () => {
    confirmationAnswering(BAD_REQUEST);
    renderPage(`?${EMAIL_LINK_TOKEN_PARAM}=token-sem-email`);

    expect(await screen.findByRole('link', { name: SIGN_IN_LABEL })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: RESEND_LABEL })).not.toBeInTheDocument();
  });

  it('should say the account was banned when the api refuses the session', async () => {
    confirmationAnswering(FORBIDDEN);
    renderPage(linkSearch('token-de-banido'));

    expect(
      await screen.findByRole('heading', { name: C.BANNED_ACCOUNT_TITLE }),
    ).toBeInTheDocument();
    expect(screen.getByText(BANNED_ACCOUNT_MESSAGE)).toBeInTheDocument();
    expect(tokenStorage.getToken()).toBeNull();
  });

  it('should offer to try again when the confirmation fails for another reason', async () => {
    let attempts = 0;
    server.use(
      http.post(CONFIRM_EMAIL_URL, () => {
        attempts += 1;
        if (attempts === 1) return new HttpResponse(null, { status: SERVER_ERROR });

        return HttpResponse.json({ token: SESSION_TOKEN });
      }),
    );
    renderPage(linkSearch('token-instavel'));

    expect(
      await screen.findByRole('heading', { name: C.CONFIRMATION_FAILED_MESSAGE.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(C.CONFIRMATION_FAILED_MESSAGE.description)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: C.RETRY_LABEL }));

    expect(await screen.findByText(C.CONFIRMED_MESSAGE)).toBeInTheDocument();
    expect(attempts).toBe(2);
  });
});
