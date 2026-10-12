import { createMemoryRouter, RouterProvider, useLocation } from 'react-router';

import {
  RESEND_COOLDOWN_SECONDS,
  RESEND_LABEL,
  waitingLabel,
} from '@app/components/ResendLinkButton/constants';
import { SIGN_IN_LABEL } from '@app/components/SignInButton/constants';
import { LandingSectionEnum, RoutePathEnum } from '@app/routes/paths';
import { act, render, screen, userEvent } from '@app/test/testing-library';
import { prefilledEmailOf } from '@app/utils/loginPrefill';

import { CHECK_EMAIL_TITLE, checkEmailDescription } from './constants';
import { CheckEmailMessage } from '.';

const EMAIL = 'aluno.teste@aluno.cps.sp.gov.br';
const ONE_SECOND_MS = 1000;

function LandingProbe() {
  const { hash, state } = useLocation();

  return <p>{`landing ${hash} ${prefilledEmailOf(state) ?? 'sem e-mail'}`}</p>;
}

function renderMessage() {
  const router = createMemoryRouter(
    [
      { path: RoutePathEnum.SIGNUP, element: <CheckEmailMessage email={EMAIL} /> },
      { path: RoutePathEnum.LANDING, element: <LandingProbe /> },
    ],
    { initialEntries: [RoutePathEnum.SIGNUP] },
  );
  render(<RouterProvider router={router} />);
}

describe('CheckEmailMessage', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should name the address the link went to', () => {
    renderMessage();

    expect(screen.getByRole('heading', { name: CHECK_EMAIL_TITLE })).toBeInTheDocument();
    expect(screen.getByText(checkEmailDescription(EMAIL))).toBeInTheDocument();
  });

  // O primeiro link saiu com o cadastro: o reenvio só libera depois do intervalo da API.
  it('should open the resend already waiting and free it after the interval', () => {
    vi.useFakeTimers();
    renderMessage();

    expect(
      screen.getByRole('button', { name: waitingLabel(RESEND_COOLDOWN_SECONDS) }),
    ).toBeDisabled();

    act(() => vi.advanceTimersByTime(RESEND_COOLDOWN_SECONDS * ONE_SECOND_MS));

    expect(screen.getByRole('button', { name: RESEND_LABEL })).toBeEnabled();
  });

  it('should lead to the login with the email filled', async () => {
    renderMessage();

    await userEvent.click(screen.getByRole('link', { name: SIGN_IN_LABEL }));

    expect(
      await screen.findByText(`landing #${LandingSectionEnum.LOGIN} ${EMAIL}`),
    ).toBeInTheDocument();
  });
});
