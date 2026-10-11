import { createMemoryRouter, RouterProvider } from 'react-router';
import { http, HttpResponse } from 'msw';

import { SIGNUP_LINK_LABEL } from '@app/components/SignupPrompt/constants';
import { FATEC_EMAIL_DOMAIN_MESSAGE } from '@app/constants/fatecEmail';
import { server } from '@app/mocks/server';
import { LOGIN_MESSAGES } from '@app/pages/Home/components/LandingLoginCard/schema';
import { RoutePathEnum } from '@app/routes/paths';
import { render, screen, userEvent, waitFor, within } from '@app/test/testing-library';
import { loginPrefillState } from '@app/utils/loginPrefill';

import {
  RESET_LINK_SENT_TITLE,
  resetLinkSentDescription,
} from './components/ResetLinkSentMessage/constants';
import * as C from './constants';
import { ForgotPassword } from '.';

const FORGOT_PASSWORD_URL = 'https://api.fateconnect.test/auth/forgot-password';
const NO_CONTENT = 204;
const NOT_FOUND = 404;
const SERVER_ERROR = 500;
const EMAIL = 'aluno.teste@aluno.cps.sp.gov.br';

function renderPage(email?: string) {
  const router = createMemoryRouter(
    [
      { path: RoutePathEnum.FORGOT_PASSWORD, element: <ForgotPassword /> },
      { path: RoutePathEnum.SIGNUP, element: <p>cadastro</p> },
    ],
    {
      initialEntries: [
        { pathname: RoutePathEnum.FORGOT_PASSWORD, state: email && loginPrefillState(email) },
      ],
    },
  );
  render(<RouterProvider router={router} />);
}

function emailField() {
  return screen.getByRole('textbox', { name: new RegExp(C.EMAIL_LABEL) });
}

function submit() {
  return userEvent.click(screen.getByRole('button', { name: C.SUBMIT_LABEL }));
}

describe('ForgotPassword', () => {
  it('should bring the email typed on the login', () => {
    renderPage(EMAIL);

    expect(emailField()).toHaveValue(EMAIL);
  });

  it('should ask for the email and refuse one outside the institutional domain', async () => {
    renderPage();

    await submit();
    expect(await screen.findByText(LOGIN_MESSAGES.emailRequired)).toBeInTheDocument();

    await userEvent.type(emailField(), 'maria@gmail.com');
    await submit();
    expect(await screen.findByText(FATEC_EMAIL_DOMAIN_MESSAGE)).toBeInTheDocument();
  });

  it('should ask for the link and show where it went, with the resend already waiting', async () => {
    const receivedBodies: unknown[] = [];
    server.use(
      http.post(FORGOT_PASSWORD_URL, async ({ request }) => {
        receivedBodies.push(await request.json());

        return new HttpResponse(null, { status: NO_CONTENT });
      }),
    );
    renderPage(EMAIL);

    await submit();

    expect(await screen.findByRole('heading', { name: RESET_LINK_SENT_TITLE })).toBeInTheDocument();
    expect(screen.getByText(resetLinkSentDescription(EMAIL))).toBeInTheDocument();
    expect(receivedBodies).toEqual([{ fatecEmail: EMAIL }]);
    // O primeiro link acabou de sair: o reenvio abre esperando. O rótulo com o
    // contador tem teste próprio, com relógio falso.
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should point at the field and the signup when the email has no account', async () => {
    server.use(
      http.post(FORGOT_PASSWORD_URL, () =>
        HttpResponse.json({ error: 'sem conta' }, { status: NOT_FOUND }),
      ),
    );
    renderPage(EMAIL);

    await submit();

    expect(await screen.findByText(C.NO_ACCOUNT_MESSAGE)).toBeInTheDocument();
    expect(emailField()).toHaveFocus();
    expect(screen.getByRole('link', { name: SIGNUP_LINK_LABEL })).toHaveAttribute(
      'href',
      RoutePathEnum.SIGNUP,
    );
  });

  it('should report another failure and keep the form', async () => {
    server.use(
      http.post(FORGOT_PASSWORD_URL, () => new HttpResponse(null, { status: SERVER_ERROR })),
    );
    renderPage(EMAIL);

    await submit();

    expect(await screen.findByText(C.REQUEST_FAILED_MESSAGE)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: C.SUBMIT_LABEL })).toBeEnabled();
  });

  it('should hold the button while the api answers', async () => {
    let respond: VoidFunction = () => {};
    const held = new Promise<void>((resolve) => {
      respond = resolve;
    });
    server.use(
      http.post(FORGOT_PASSWORD_URL, async () => {
        await held;

        return new HttpResponse(null, { status: NO_CONTENT });
      }),
    );
    renderPage(EMAIL);

    await submit();

    const button = screen.getByRole('button', { name: C.SUBMIT_LABEL });
    await waitFor(() => expect(button).toBeDisabled());
    expect(within(button).getByRole('progressbar')).toBeInTheDocument();

    respond();
    expect(await screen.findByRole('heading', { name: RESET_LINK_SENT_TITLE })).toBeInTheDocument();
  });
});
