import { http, HttpResponse } from 'msw';
import { RouterProvider, createMemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { server } from '@app/mocks/server';
import { LandingSection, RoutePath } from '@app/routes/paths';
import { render, screen, userEvent, waitFor, within } from '@app/test/testing-library';
import { LandingLoginCard } from '.';
import { LOGIN_ERROR_MESSAGES, PASSWORD_TOGGLE_LABEL, SUBMIT_LABEL } from './constants';
import { LOGIN_MESSAGES } from './schema';

const LOGIN_URL = 'https://api.fateconnect.test/auth/login';

function renderCard(initialPath: string = RoutePath.LANDING) {
  const router = createMemoryRouter(
    [
      { path: RoutePath.LANDING, element: <LandingLoginCard /> },
      { path: RoutePath.MENU, element: <div>menu</div> },
    ],
    { initialEntries: [initialPath] },
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

    await userEvent.click(screen.getByRole('button', { name: SUBMIT_LABEL }));

    expect(await screen.findByText(LOGIN_MESSAGES.emailRequired)).toBeInTheDocument();
    expect(screen.getByText(LOGIN_MESSAGES.passwordRequired)).toBeInTheDocument();
  });

  it('should reject a malformed email', async () => {
    renderCard();
    await preencher('nao-e-email', 'segredo123');

    await userEvent.click(screen.getByRole('button', { name: SUBMIT_LABEL }));

    expect(await screen.findByText(LOGIN_MESSAGES.emailInvalid)).toBeInTheDocument();
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

  it('should greet the user and go to the menu after a successful login', async () => {
    server.use(
      http.post(LOGIN_URL, () =>
        HttpResponse.json({ token: 'abc', nomeCompleto: 'Fulano de Tal' }),
      ),
    );
    const router = renderCard();
    await preencher('aluno@fatec.sp.gov.br', 'segredo123');

    await userEvent.click(screen.getByRole('button', { name: SUBMIT_LABEL }));

    expect(await screen.findByText('Bem-vindo(a), Fulano de Tal!')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(RoutePath.MENU);
  });

  it('should report invalid credentials when the api answers unauthorized', async () => {
    server.use(http.post(LOGIN_URL, () => new HttpResponse(null, { status: 401 })));
    renderCard();
    await preencher('aluno@fatec.sp.gov.br', 'segredo-errado');

    await userEvent.click(screen.getByRole('button', { name: SUBMIT_LABEL }));

    expect(await screen.findByText(LOGIN_ERROR_MESSAGES.invalidCredentials)).toBeInTheDocument();
  });

  it('should report a generic failure for other api errors', async () => {
    server.use(http.post(LOGIN_URL, () => new HttpResponse(null, { status: 500 })));
    renderCard();
    await preencher('aluno@fatec.sp.gov.br', 'segredo123');

    await userEvent.click(screen.getByRole('button', { name: SUBMIT_LABEL }));

    expect(await screen.findByText(LOGIN_ERROR_MESSAGES.generic)).toBeInTheDocument();
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

        return HttpResponse.json({ token: 'abc', nomeCompleto: 'Fulano' });
      }),
    );
    renderCard();
    await preencher('aluno@fatec.sp.gov.br', 'segredo123');

    await userEvent.click(screen.getByRole('button', { name: SUBMIT_LABEL }));

    const submitButton = screen.getByRole('button', { name: SUBMIT_LABEL });
    await waitFor(() => expect(submitButton).toBeDisabled());
    expect(within(submitButton).getByRole('progressbar')).toBeInTheDocument();

    respond();
  });

  it('should focus the email field when the page is opened at the login anchor', async () => {
    renderCard(`${RoutePath.LANDING}#${LandingSection.LOGIN}`);

    expect(screen.getByLabelText(/E-mail/)).toHaveFocus();
  });
});
