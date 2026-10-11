import { PageMessage } from '@design-system';

import { ResendLinkButton } from '@app/components/ResendLinkButton';
import { RESEND_COOLDOWN_SECONDS } from '@app/components/ResendLinkButton/constants';
import { SignInButton } from '@app/components/SignInButton';
import { RESET_LINK_RESENT } from '@app/constants/emailLink';
import { useCountdown } from '@app/hooks/useCountdown';
import { forgotPassword } from '@app/services/auth/authService';

import * as C from './constants';

type ResetLinkSentMessageProps = Readonly<{ email: string }>;

export function ResetLinkSentMessage({ email }: ResetLinkSentMessageProps) {
  // O primeiro link acabou de sair com o pedido.
  const resendCountdown = useCountdown(RESEND_COOLDOWN_SECONDS);

  return (
    <PageMessage
      title={C.RESET_LINK_SENT_TITLE}
      description={C.resetLinkSentDescription(email)}
      tone="info"
    >
      <ResendLinkButton
        email={email}
        send={forgotPassword}
        sentMessage={RESET_LINK_RESENT}
        countdown={resendCountdown}
        variant="soft"
      />
      <SignInButton email={email} />
    </PageMessage>
  );
}
