import { StrictMode } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { http, HttpResponse } from 'msw';

import {
  REACTIVATION_DIALOG,
  REACTIVATION_SUCCEEDED,
} from '@app/components/AccountReactivationDialog/constants';
import { RESEND_LABEL } from '@app/components/ResendLinkButton/constants';
import { SIGN_IN_LABEL } from '@app/components/SignInButton/constants';
import { BANNED_ACCOUNT_MESSAGE } from '@app/constants/bannedAccount';
import { RESET_LINK_RESENT } from '@app/constants/emailLink';
import { server } from '@app/mocks/server';
import { SIGNUP_MESSAGES } from '@app/pages/Signup/schema';
import { RoutePathEnum } from '@app/routes/paths';
import { tokenStorage } from '@app/services/auth/tokenStorage';
import { render, screen, userEvent, waitFor, within } from '@app/test/testing-library';
import { EMAIL_LINK_EMAIL_PARAM, EMAIL_LINK_TOKEN_PARAM } from '@app/utils/emailLink';

import { RESET_LINK_EXPIRED_MESSAGE } from './components/ResetLinkExpiredMessage/constants';
import { NEW_PASSWORD_MESSAGES } from './schema';
import * as FORM from './components/NewPasswordForm/constants';
import * as C from './constants';
import { ResetPassword } from '.';

const VERIFY_URL = 'https://api.fateconnect.test/auth/verify-reset-token';
const RESET_URL = 'https://api.fateconnect.test/auth/reset-password';
const FORGOT_PASSWORD_URL = 'https://api.fateconnect.test/auth/forgot-password';
const REACTIVATE_URL = 'https://api.fateconnect.test/auth/reactivate';
const NO_CONTENT = 204;
const BAD_REQUEST = 400;
const FORBIDDEN = 403;
const CONFLICT = 409;
const SERVER_ERROR = 500;
const EMAIL = 'aluno.teste@aluno.cps.sp.gov.br';
const NEW_PASSWORD = 'senha-nova-1';
const SESSION_TOKEN = 'sessao-da-redefinicao';

function renderPage(search: string) {
  const router = createMemoryRouter(
    [
      { path: RoutePathEnum.RESET_PASSWORD, element: <ResetPassword /> },
      { path: RoutePathEnum.MENU, element: <p>menu</p> },
      { path: RoutePathEnum.LANDING, element: <p>landing</p> },
    ],
    { initialEntries: [`${RoutePathEnum.RESET_PASSWORD}${search}`] },
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

function verifyAnswering(status: number) {
  server.use(http.get(VERIFY_URL, () => new HttpResponse(null, { status })));
}

async function saveNewPassword(password = NEW_PASSWORD, confirmation = password) {
  const field = await screen.findByLabelText(new RegExp(`^${FORM.NEW_PASSWORD_LABEL}`));
  await userEvent.type(field, password);
  if (confirmation)
    await userEvent.type(
      screen.getByLabelText(new RegExp(FORM.PASSWORD_CONFIRMATION_LABEL)),
      confirmation,
    );
  await userEvent.click(screen.getByRole('button', { name: FORM.SUBMIT_LABEL }));
}

describe('ResetPassword', () => {
  it('should check the link once before showing the form', async () => {
    const checkedTokens: (string | null)[] = [];
    server.use(
      http.get(VERIFY_URL, ({ request }) => {
        checkedTokens.push(new URL(request.url).searchParams.get('token'));

        return new HttpResponse(null, { status: NO_CONTENT });
      }),
    );
    renderPage(linkSearch('token-que-vale'));

    expect(screen.getByRole('progressbar', { name: C.LOADING_TITLE })).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: FORM.NEW_PASSWORD_TITLE }),
    ).toBeInTheDocument();
    expect(checkedTokens).toEqual(['token-que-vale']);
  });

  it('should save the new password, open the session and go to the menu', async () => {
    verifyAnswering(NO_CONTENT);
    let body: unknown = null;
    server.use(
      http.post(RESET_URL, async ({ request }) => {
        body = await request.json();

        return HttpResponse.json({ token: SESSION_TOKEN });
      }),
    );
    const router = renderPage(linkSearch('token-que-vale'));

    await saveNewPassword();

    expect(await screen.findByText(FORM.PASSWORD_CHANGED_MESSAGE)).toBeInTheDocument();
    await waitFor(() => expect(router.state.location.pathname).toBe(RoutePathEnum.MENU));
    expect(body).toEqual({ token: 'token-que-vale', newPassword: NEW_PASSWORD });
    expect(tokenStorage.getToken()).toBe(SESSION_TOKEN);
  });

  it('should hold the new password to the signup rules', async () => {
    verifyAnswering(NO_CONTENT);
    renderPage(linkSearch('token-que-vale'));

    await saveNewPassword('curta');

    expect(await screen.findByText(SIGNUP_MESSAGES.passwordTooShort)).toBeInTheDocument();
  });

  it('should ask to confirm the new password and refuse a different one, without saving', async () => {
    verifyAnswering(NO_CONTENT);
    let saved = false;
    server.use(
      http.post(RESET_URL, () => {
        saved = true;

        return HttpResponse.json({ token: SESSION_TOKEN });
      }),
    );
    renderPage(linkSearch('token-que-vale'));

    await saveNewPassword(NEW_PASSWORD, '');
    // O rótulo e o erro do campo vazio são o mesmo texto: o erro se lê na descrição.
    const confirmation = screen.getByLabelText(new RegExp(FORM.PASSWORD_CONFIRMATION_LABEL));
    await waitFor(() =>
      expect(confirmation).toHaveAccessibleDescription(NEW_PASSWORD_MESSAGES.confirmationRequired),
    );

    await userEvent.type(confirmation, 'outra-senha-1');
    await userEvent.click(screen.getByRole('button', { name: FORM.SUBMIT_LABEL }));

    await waitFor(() =>
      expect(confirmation).toHaveAccessibleDescription(NEW_PASSWORD_MESSAGES.confirmationMismatch),
    );
    expect(saved).toBe(false);
  });

  it('should offer a new link for the email of the link when it expired or was used', async () => {
    verifyAnswering(BAD_REQUEST);
    const resentBodies: unknown[] = [];
    server.use(
      http.post(FORGOT_PASSWORD_URL, async ({ request }) => {
        resentBodies.push(await request.json());

        return new HttpResponse(null, { status: NO_CONTENT });
      }),
    );
    renderPage(linkSearch('token-vencido'));

    expect(
      await screen.findByRole('heading', { name: RESET_LINK_EXPIRED_MESSAGE.title }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: SIGN_IN_LABEL })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: RESEND_LABEL }));

    expect(await screen.findByText(RESET_LINK_RESENT)).toBeInTheDocument();
    expect(resentBodies).toEqual([{ fatecEmail: EMAIL }]);
  });

  it('should treat a link without token as expired, without calling the api', async () => {
    let called = false;
    server.use(
      http.get(VERIFY_URL, () => {
        called = true;

        return new HttpResponse(null, { status: NO_CONTENT });
      }),
    );
    renderPage(`?${EMAIL_LINK_EMAIL_PARAM}=${encodeURIComponent(EMAIL)}`);

    expect(
      await screen.findByRole('heading', { name: RESET_LINK_EXPIRED_MESSAGE.title }),
    ).toBeInTheDocument();
    expect(called).toBe(false);
  });

  it('should show the expired link when it stops working before the password is saved', async () => {
    verifyAnswering(NO_CONTENT);
    server.use(http.post(RESET_URL, () => new HttpResponse(null, { status: BAD_REQUEST })));
    renderPage(linkSearch('token-que-venceu'));

    await saveNewPassword();

    expect(
      await screen.findByRole('heading', { name: RESET_LINK_EXPIRED_MESSAGE.title }),
    ).toBeInTheDocument();
  });

  it('should say the account was banned and keep the form', async () => {
    verifyAnswering(NO_CONTENT);
    server.use(http.post(RESET_URL, () => new HttpResponse(null, { status: FORBIDDEN })));
    renderPage(linkSearch('token-de-banido'));

    await saveNewPassword();

    expect(await screen.findByText(BANNED_ACCOUNT_MESSAGE)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: FORM.NEW_PASSWORD_TITLE })).toBeInTheDocument();
    expect(tokenStorage.getToken()).toBeNull();
  });

  // A senha já mudou: falta reativar, e a reativação usa o e-mail do link e a senha nova.
  it('should offer to reactivate a deactivated account with the new password', async () => {
    verifyAnswering(NO_CONTENT);
    let reactivationBody: unknown = null;
    server.use(
      http.post(RESET_URL, () => new HttpResponse(null, { status: CONFLICT })),
      http.post(REACTIVATE_URL, async ({ request }) => {
        reactivationBody = await request.json();

        return HttpResponse.json({ token: SESSION_TOKEN });
      }),
    );
    const router = renderPage(linkSearch('token-de-desativada'));

    await saveNewPassword();
    const dialog = await screen.findByRole('dialog', { name: REACTIVATION_DIALOG.title });
    await userEvent.click(
      within(dialog).getByRole('button', { name: REACTIVATION_DIALOG.confirmLabel }),
    );

    await waitFor(() => expect(router.state.location.pathname).toBe(RoutePathEnum.MENU));
    expect(reactivationBody).toEqual({ fatecEmail: EMAIL, password: NEW_PASSWORD });
    expect(await screen.findByText(REACTIVATION_SUCCEEDED)).toBeInTheDocument();
  });

  it('should offer to try again when the check fails for another reason', async () => {
    let attempts = 0;
    server.use(
      http.get(VERIFY_URL, () => {
        attempts += 1;
        if (attempts === 1) return new HttpResponse(null, { status: SERVER_ERROR });

        return new HttpResponse(null, { status: NO_CONTENT });
      }),
    );
    renderPage(linkSearch('token-instavel'));

    expect(
      await screen.findByRole('heading', { name: C.VERIFY_FAILED_MESSAGE.title }),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: C.RETRY_LABEL }));

    expect(
      await screen.findByRole('heading', { name: FORM.NEW_PASSWORD_TITLE }),
    ).toBeInTheDocument();
    expect(attempts).toBe(2);
  });
});
