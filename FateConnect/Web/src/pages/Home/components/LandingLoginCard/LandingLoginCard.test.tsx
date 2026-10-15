import { createMemoryRouter, RouterProvider, type InitialEntry } from 'react-router';
import { PASSWORD_TOGGLE_LABEL } from '@design-system';
import { http, HttpResponse } from 'msw';

import {
  REACTIVATION_DIALOG,
  REACTIVATION_SUCCEEDED,
} from '@app/components/AccountReactivationDialog/constants';
import { RESEND_LABEL } from '@app/components/ResendLinkButton/constants';
import { CONFIRMATION_LINK_RESENT } from '@app/constants/emailLink';
import {
  FATEC_EMAIL_DOMAIN_MESSAGE,
  FATEC_EMAIL_LOCAL_PART_MESSAGE,
} from '@app/constants/fatecEmail';
import { server } from '@app/mocks/server';
import { LandingSectionEnum, RoutePathEnum } from '@app/routes/paths';
import { render, screen, userEvent, waitFor, within } from '@app/test/testing-library';
import { problemResponse } from '@app/test/utils/problemResponse';
import { loginPrefillState, prefilledEmailOf } from '@app/utils/loginPrefill';

import {
  ACCOUNT_LOCKED_DIALOG,
  lockedAccountMessage,
} from './components/AccountLockedDialog/constants';
import { EMAIL_NOT_CONFIRMED_DIALOG } from './components/EmailNotConfirmedDialog/constants';
import { LOGIN_MESSAGES } from './schema';
import * as C from './constants';
import { LandingLoginCard } from '.';

const LOGIN_URL = 'https://api.fateconnect.test/auth/login';
const REACTIVATE_URL = 'https://api.fateconnect.test/auth/reactivate';
const RESEND_URL = 'https://api.fateconnect.test/auth/resend-confirmation-email';
const NO_CONTENT = 204;

const FORBIDDEN = 403;
const CONFLICT = 409;
const TOO_MANY_REQUESTS = 429;
const SERVER_ERROR = 500;
const EMAIL = 'aluno.teste@aluno.cps.sp.gov.br';
const PASSWORD = 'segredo123';

function renderCard(initialEntry: InitialEntry = RoutePathEnum.LANDING) {
  const router = createMemoryRouter(
    [
      { path: RoutePathEnum.LANDING, element: <LandingLoginCard /> },
      { path: RoutePathEnum.MENU, element: <div>menu</div> },
    ],
    { initialEntries: [initialEntry] },
  );
  render(<RouterProvider router={router} />);

  return router;
}

async function preencher(email: string, senha: string) {
  await userEvent.type(screen.getByLabelText(/E-mail/), email);
  await userEvent.type(screen.getByLabelText(/Senha/), senha);
}

describe('LandingLoginCard', () => {
  it('should show the required messages when submitting an empty form', async () => {
    renderCard();

    await userEvent.click(screen.getByRole('button', { name: C.SUBMIT_LABEL }));

    expect(await screen.findByText(LOGIN_MESSAGES.emailRequired)).toBeInTheDocument();
    expect(screen.getByText(LOGIN_MESSAGES.passwordRequired)).toBeInTheDocument();
  });

  it('should reject a malformed email naming the domain', async () => {
    renderCard();
    await preencher('nao-e-email', 'segredo123');

    await userEvent.click(screen.getByRole('button', { name: C.SUBMIT_LABEL }));

    expect(await screen.findByText(FATEC_EMAIL_DOMAIN_MESSAGE)).toBeInTheDocument();
  });

  it('should name what comes before the at sign when the email carries an accent', async () => {
    renderCard();
    await preencher('josé_silva@aluno.cps.sp.gov.br', 'segredo123');

    await userEvent.click(screen.getByRole('button', { name: C.SUBMIT_LABEL }));

    expect(await screen.findByText(FATEC_EMAIL_LOCAL_PART_MESSAGE)).toBeInTheDocument();
  });

  it('should toggle the password visibility', async () => {
    renderCard();
    const campoSenha = screen.getByLabelText(/Senha/);

    expect(campoSenha).toHaveAttribute('type', 'password');

    await userEvent.click(screen.getByRole('button', { name: PASSWORD_TOGGLE_LABEL }));

    expect(campoSenha).toHaveAttribute('type', 'text');
  });

  it('should show an icon that reflects whether the password is visible', async () => {
    renderCard();

    // Senha oculta: olho cortado. O ícone mostra o estado, não a ação.
    expect(screen.getByTestId('VisibilityOffIcon')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: PASSWORD_TOGGLE_LABEL }));

    expect(screen.getByTestId('VisibilityIcon')).toBeInTheDocument();
  });

  it('should go to the menu after a successful login, without any alert', async () => {
    server.use(
      http.post(LOGIN_URL, () => HttpResponse.json({ token: 'abc', fullName: 'Fulano de Tal' })),
    );
    const router = renderCard();
    await preencher('aluno.teste@aluno.cps.sp.gov.br', 'segredo123');

    await userEvent.click(screen.getByRole('button', { name: C.SUBMIT_LABEL }));

    await waitFor(() => expect(router.state.location.pathname).toBe(RoutePathEnum.MENU));
    // Todo aviso do produto traz um botão "OK" para dispensar; sem ele, não há aviso.
    expect(screen.queryByRole('button', { name: 'OK' })).not.toBeInTheDocument();
  });

  it('should report invalid credentials when the api answers unauthorized', async () => {
    server.use(http.post(LOGIN_URL, () => new HttpResponse(null, { status: 401 })));
    renderCard();
    await preencher('aluno.teste@aluno.cps.sp.gov.br', 'segredo-errado');

    await userEvent.click(screen.getByRole('button', { name: C.SUBMIT_LABEL }));

    expect(await screen.findByText(C.LOGIN_ERROR_MESSAGES.invalidCredentials)).toBeInTheDocument();
  });

  it('should report a generic failure for other api errors', async () => {
    server.use(http.post(LOGIN_URL, () => new HttpResponse(null, { status: 500 })));
    renderCard();
    await preencher('aluno.teste@aluno.cps.sp.gov.br', 'segredo123');

    await userEvent.click(screen.getByRole('button', { name: C.SUBMIT_LABEL }));

    expect(await screen.findByText(C.LOGIN_ERROR_MESSAGES.generic)).toBeInTheDocument();
  });

  it('should report a banned account without offering any action', async () => {
    server.use(http.post(LOGIN_URL, () => new HttpResponse(null, { status: FORBIDDEN })));
    renderCard();
    await preencher(EMAIL, PASSWORD);

    await userEvent.click(screen.getByRole('button', { name: C.SUBMIT_LABEL }));

    expect(await screen.findByText(C.LOGIN_ERROR_MESSAGES.bannedAccount)).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should explain the missing confirmation and resend the link to the typed email', async () => {
    const resentBodies: unknown[] = [];
    server.use(
      http.post(LOGIN_URL, () => problemResponse(FORBIDDEN, { code: 'EmailNotConfirmed' })),
      http.post(RESEND_URL, async ({ request }) => {
        resentBodies.push(await request.json());

        return new HttpResponse(null, { status: NO_CONTENT });
      }),
    );
    renderCard();
    await preencher(EMAIL, PASSWORD);

    await userEvent.click(screen.getByRole('button', { name: C.SUBMIT_LABEL }));
    const dialog = await screen.findByRole('dialog', { name: EMAIL_NOT_CONFIRMED_DIALOG.title });
    expect(within(dialog).getByText(EMAIL_NOT_CONFIRMED_DIALOG.message)).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('button', { name: RESEND_LABEL }));

    expect(await screen.findByText(CONFIRMATION_LINK_RESENT)).toBeInTheDocument();
    expect(resentBodies).toEqual([{ fatecEmail: EMAIL }]);
    expect(screen.queryByText(C.LOGIN_ERROR_MESSAGES.bannedAccount)).not.toBeInTheDocument();
  });

  // O diálogo desmonta o botão ao fechar; a espera mora no cartão para não liberar
  // um clique que a API descartaria.
  it('should keep the resend waiting when the dialog opens again', async () => {
    server.use(
      http.post(LOGIN_URL, () =>
        HttpResponse.json({ code: 'EmailNotConfirmed' }, { status: FORBIDDEN }),
      ),
      http.post(RESEND_URL, () => new HttpResponse(null, { status: NO_CONTENT })),
    );
    renderCard();
    await preencher(EMAIL, PASSWORD);
    await userEvent.click(screen.getByRole('button', { name: C.SUBMIT_LABEL }));
    const dialog = await screen.findByRole('dialog', { name: EMAIL_NOT_CONFIRMED_DIALOG.title });
    await userEvent.click(within(dialog).getByRole('button', { name: RESEND_LABEL }));
    await screen.findByText(CONFIRMATION_LINK_RESENT);

    await userEvent.click(
      within(dialog).getByRole('button', { name: EMAIL_NOT_CONFIRMED_DIALOG.closeLabel }),
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: C.SUBMIT_LABEL }));

    const reopened = await screen.findByRole('dialog', { name: EMAIL_NOT_CONFIRMED_DIALOG.title });
    expect(within(reopened).getAllByRole('button').at(-1)).toBeDisabled();
  });

  it('should lead to the forgotten password with the typed email', async () => {
    const router = createMemoryRouter(
      [
        { path: RoutePathEnum.LANDING, element: <LandingLoginCard /> },
        { path: RoutePathEnum.FORGOT_PASSWORD, element: <p>esqueci</p> },
      ],
      { initialEntries: [RoutePathEnum.LANDING] },
    );
    render(<RouterProvider router={router} />);
    await userEvent.type(screen.getByLabelText(/E-mail/), EMAIL);

    await userEvent.click(screen.getByRole('link', { name: C.FORGOT_PASSWORD_LINK_LABEL }));

    expect(await screen.findByText('esqueci')).toBeInTheDocument();
    expect(prefilledEmailOf(router.state.location.state)).toBe(EMAIL);
  });

  it('should reactivate a deactivated account with the typed credentials and enter', async () => {
    let reactivationBody: unknown = null;
    server.use(
      http.post(LOGIN_URL, () => new HttpResponse(null, { status: CONFLICT })),
      http.post(REACTIVATE_URL, async ({ request }) => {
        reactivationBody = await request.json();

        return HttpResponse.json({ token: 'abc' });
      }),
    );
    const router = renderCard();
    await preencher(EMAIL, PASSWORD);

    await userEvent.click(screen.getByRole('button', { name: C.SUBMIT_LABEL }));
    const dialog = await screen.findByRole('dialog', { name: REACTIVATION_DIALOG.title });
    expect(within(dialog).getByText(REACTIVATION_DIALOG.message)).toBeInTheDocument();
    await userEvent.click(
      within(dialog).getByRole('button', { name: REACTIVATION_DIALOG.confirmLabel }),
    );

    await waitFor(() => expect(router.state.location.pathname).toBe(RoutePathEnum.MENU));
    expect(reactivationBody).toEqual({ fatecEmail: EMAIL, password: PASSWORD });
    expect(await screen.findByText(REACTIVATION_SUCCEEDED)).toBeInTheDocument();
  });

  it('should stay on the landing without reactivating when the person gives up', async () => {
    let reactivationCalled = false;
    server.use(
      http.post(LOGIN_URL, () => new HttpResponse(null, { status: CONFLICT })),
      http.post(REACTIVATE_URL, () => {
        reactivationCalled = true;

        return HttpResponse.json({ token: 'abc' });
      }),
    );
    const router = renderCard();
    await preencher(EMAIL, PASSWORD);

    await userEvent.click(screen.getByRole('button', { name: C.SUBMIT_LABEL }));
    const dialog = await screen.findByRole('dialog', { name: REACTIVATION_DIALOG.title });
    await userEvent.click(
      within(dialog).getByRole('button', { name: REACTIVATION_DIALOG.dismissLabel }),
    );

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(router.state.location.pathname).toBe(RoutePathEnum.LANDING);
    expect(reactivationCalled).toBe(false);
  });

  it('should close the dialog and report the failure when the reactivation fails', async () => {
    server.use(
      http.post(LOGIN_URL, () => new HttpResponse(null, { status: CONFLICT })),
      http.post(REACTIVATE_URL, () => new HttpResponse(null, { status: SERVER_ERROR })),
    );
    const router = renderCard();
    await preencher(EMAIL, PASSWORD);

    await userEvent.click(screen.getByRole('button', { name: C.SUBMIT_LABEL }));
    const dialog = await screen.findByRole('dialog', { name: REACTIVATION_DIALOG.title });
    await userEvent.click(
      within(dialog).getByRole('button', { name: REACTIVATION_DIALOG.confirmLabel }),
    );

    expect(await screen.findByText(C.LOGIN_ERROR_MESSAGES.generic)).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(router.state.location.pathname).toBe(RoutePathEnum.LANDING);
  });

  it('should show the loading indicator while the request is in flight', async () => {
    // A resposta só chega quando o teste soltar: espera por tempo torna o caso
    // instável, porque a requisição pode terminar antes da verificação.
    let respond: VoidFunction = () => {};
    const held = new Promise<void>((resolve) => {
      respond = resolve;
    });
    server.use(
      http.post(LOGIN_URL, async () => {
        await held;

        return HttpResponse.json({ token: 'abc', fullName: 'Fulano' });
      }),
    );
    renderCard();
    await preencher('aluno.teste@aluno.cps.sp.gov.br', 'segredo123');

    await userEvent.click(screen.getByRole('button', { name: C.SUBMIT_LABEL }));

    const submitButton = screen.getByRole('button', { name: C.SUBMIT_LABEL });
    await waitFor(() => expect(submitButton).toBeDisabled());
    expect(within(submitButton).getByRole('progressbar')).toBeInTheDocument();

    respond();
  });

  it('should explain the locked account in a dialog, with the minutes the api returns', async () => {
    server.use(
      http.post(LOGIN_URL, () =>
        problemResponse(TOO_MANY_REQUESTS, { code: 'AccountLocked', minutesRemaining: 12 }),
      ),
    );
    renderCard();
    await preencher(EMAIL, PASSWORD);

    await userEvent.click(screen.getByRole('button', { name: C.SUBMIT_LABEL }));
    const dialog = await screen.findByRole('dialog', { name: ACCOUNT_LOCKED_DIALOG.title });

    expect(
      within(dialog).getByText(
        'Por segurança, a conta foi bloqueada após várias tentativas de entrar com a senha incorreta. Para entrar, use o link enviado ao seu e-mail Fatec ou aguarde 12 minutos e tente novamente.',
      ),
    ).toBeInTheDocument();
    // O bloqueio é explicado no diálogo; um aviso a mais repetiria o recado.
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    await userEvent.click(
      within(dialog).getByRole('button', { name: ACCOUNT_LOCKED_DIALOG.closeLabel }),
    );

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('should write a single minute in the singular', () => {
    expect(lockedAccountMessage(1)).toBe(
      'Por segurança, a conta foi bloqueada após várias tentativas de entrar com a senha incorreta. Para entrar, use o link enviado ao seu e-mail Fatec ou aguarde 1 minuto e tente novamente.',
    );
  });

  it('should point only to the link when the api does not say the minutes', () => {
    expect(lockedAccountMessage(undefined)).toBe(
      'Por segurança, a conta foi bloqueada após várias tentativas de entrar com a senha incorreta. Para entrar, use o link enviado ao seu e-mail Fatec.',
    );
  });

  it('should fill the email and focus the password when it comes from the unlock page', () => {
    renderCard({
      pathname: RoutePathEnum.LANDING,
      hash: `#${LandingSectionEnum.LOGIN}`,
      state: loginPrefillState(EMAIL),
    });

    expect(screen.getByLabelText(/E-mail/)).toHaveValue(EMAIL);
    expect(screen.getByLabelText(/Senha/)).toHaveFocus();
  });

  it('should focus the email field when the page is opened at the login anchor', async () => {
    renderCard(`${RoutePathEnum.LANDING}#${LandingSectionEnum.LOGIN}`);

    expect(screen.getByLabelText(/E-mail/)).toHaveFocus();
  });
});
