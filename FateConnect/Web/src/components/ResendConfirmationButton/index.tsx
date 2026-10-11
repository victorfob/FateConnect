import { useCallback } from 'react';
import { Button, type ButtonProps } from '@design-system';
import { useMutation } from '@tanstack/react-query';

import type { Countdown } from '@app/hooks/useCountdown';
import { useNotification } from '@app/hooks/useNotification';
import { resendConfirmationEmail } from '@app/services/auth/authService';

import * as C from './constants';

type ResendConfirmationButtonProps = Readonly<
  {
    email: string;
    /** De quem monta o botão: a espera sobrevive ao diálogo que fecha e reabre. */
    countdown: Countdown;
  } & Pick<ButtonProps, 'variant'>
>;

export function ResendConfirmationButton({
  email,
  countdown: { secondsLeft, running, start },
  variant = 'contained',
}: ResendConfirmationButtonProps) {
  const { notifySuccess } = useNotification();

  const { mutate, isPending } = useMutation({
    mutationFn: resendConfirmationEmail,
    meta: { errorMessage: C.RESEND_FAILED_MESSAGE },
    onSuccess: () => {
      start(C.RESEND_COOLDOWN_SECONDS);
      notifySuccess(C.RESENT_MESSAGE);
    },
  });

  const handleResend = useCallback(() => mutate(email), [email, mutate]);

  return (
    <Button
      type="button"
      variant={variant}
      color="secondary"
      loading={isPending}
      disabled={running}
      onClick={handleResend}
    >
      {running ? C.waitingLabel(secondsLeft) : C.RESEND_LABEL}
    </Button>
  );
}
