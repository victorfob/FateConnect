import { useCallback } from 'react';
import { Button, type ButtonProps } from '@design-system';
import { useMutation } from '@tanstack/react-query';

import type { Countdown } from '@app/hooks/useCountdown';
import { useNotification } from '@app/hooks/useNotification';

import * as C from './constants';

type ResendLinkButtonProps = Readonly<
  {
    email: string;
    send: (email: string) => Promise<void>;
    sentMessage: string;
    /** De quem monta o botão: a espera sobrevive ao diálogo que fecha e reabre. */
    countdown: Countdown;
  } & Pick<ButtonProps, 'variant'>
>;

export function ResendLinkButton({
  email,
  send,
  sentMessage,
  countdown: { secondsLeft, running, start },
  variant = 'contained',
}: ResendLinkButtonProps) {
  const { notifySuccess } = useNotification();

  const { mutate, isPending } = useMutation({
    mutationFn: send,
    meta: { errorMessage: C.RESEND_FAILED_MESSAGE },
    onSuccess: () => {
      start(C.RESEND_COOLDOWN_SECONDS);
      notifySuccess(sentMessage);
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
