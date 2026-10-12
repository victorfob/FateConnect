import { http, HttpResponse } from 'msw';

import { useCountdown } from '@app/hooks/useCountdown';
import { server } from '@app/mocks/server';
import { resendConfirmationEmail } from '@app/services/auth/authService';
import { act, render, screen, userEvent, waitFor, within } from '@app/test/testing-library';

import * as C from './constants';
import { ResendLinkButton } from '.';

const RESEND_URL = 'https://api.fateconnect.test/auth/resend-confirmation-email';
const NO_CONTENT = 204;
const SERVER_ERROR = 500;
const EMAIL = 'aluno.teste@aluno.cps.sp.gov.br';
const ONE_SECOND_MS = 1000;
const SENT_MESSAGE = 'Novo link enviado.';

type ButtonHostProps = Readonly<{ initialSeconds?: number }>;

function ButtonHost({ initialSeconds }: ButtonHostProps) {
  const countdown = useCountdown(initialSeconds);

  return (
    <ResendLinkButton
      email={EMAIL}
      send={resendConfirmationEmail}
      sentMessage={SENT_MESSAGE}
      countdown={countdown}
    />
  );
}

describe('ResendLinkButton', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should ask for a new link for the email and then hold the button', async () => {
    const receivedBodies: unknown[] = [];
    server.use(
      http.post(RESEND_URL, async ({ request }) => {
        receivedBodies.push(await request.json());

        return new HttpResponse(null, { status: NO_CONTENT });
      }),
    );
    render(<ButtonHost />);
    const button = screen.getByRole('button', { name: C.RESEND_LABEL });

    await userEvent.click(button);

    expect(await screen.findByText(SENT_MESSAGE)).toBeInTheDocument();
    expect(receivedBodies).toEqual([{ fatecEmail: EMAIL }]);
    await waitFor(() => expect(button).toBeDisabled());
  });

  it('should show the seconds left in the label and free the button after a minute', () => {
    vi.useFakeTimers();
    render(<ButtonHost initialSeconds={C.RESEND_COOLDOWN_SECONDS} />);

    expect(
      screen.getByRole('button', { name: C.waitingLabel(C.RESEND_COOLDOWN_SECONDS) }),
    ).toBeDisabled();

    act(() => vi.advanceTimersByTime((C.RESEND_COOLDOWN_SECONDS - 1) * ONE_SECOND_MS));
    expect(screen.getByRole('button', { name: C.waitingLabel(1) })).toBeDisabled();

    act(() => vi.advanceTimersByTime(ONE_SECOND_MS));
    expect(screen.getByRole('button', { name: C.RESEND_LABEL })).toBeEnabled();
  });

  it('should report the failure and leave the button free to try again', async () => {
    server.use(http.post(RESEND_URL, () => new HttpResponse(null, { status: SERVER_ERROR })));
    render(<ButtonHost />);

    await userEvent.click(screen.getByRole('button', { name: C.RESEND_LABEL }));

    expect(await screen.findByText(C.RESEND_FAILED_MESSAGE)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: C.RESEND_LABEL })).toBeEnabled();
  });

  it('should hold the button while the api answers', async () => {
    let respond: VoidFunction = () => {};
    const held = new Promise<void>((resolve) => {
      respond = resolve;
    });
    server.use(
      http.post(RESEND_URL, async () => {
        await held;

        return new HttpResponse(null, { status: NO_CONTENT });
      }),
    );
    render(<ButtonHost />);

    await userEvent.click(screen.getByRole('button', { name: C.RESEND_LABEL }));

    const button = screen.getByRole('button', { name: C.RESEND_LABEL });
    await waitFor(() => expect(button).toBeDisabled());
    expect(within(button).getByRole('progressbar')).toBeInTheDocument();

    respond();
    expect(await screen.findByText(SENT_MESSAGE)).toBeInTheDocument();
  });
});

describe('waitingLabel', () => {
  it('should write the time left as a clock, with two digits for the seconds', () => {
    expect(C.waitingLabel(C.RESEND_COOLDOWN_SECONDS)).toBe('Reenviar em 1:00');
    expect(C.waitingLabel(59)).toBe('Reenviar em 0:59');
    expect(C.waitingLabel(9)).toBe('Reenviar em 0:09');
  });
});
