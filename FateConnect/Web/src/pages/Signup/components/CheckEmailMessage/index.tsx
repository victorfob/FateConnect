import { PageMessage } from '@design-system';

import { ResendLinkButton } from '@app/components/ResendLinkButton';
import { RESEND_COOLDOWN_SECONDS } from '@app/components/ResendLinkButton/constants';
import { SignInButton } from '@app/components/SignInButton';
import { CONFIRMATION_LINK_RESENT } from '@app/constants/emailLink';
import { useCountdown } from '@app/hooks/useCountdown';
import { resendConfirmationEmail } from '@app/services/auth/authService';

import * as C from './constants';

type CheckEmailMessageProps = Readonly<{ email: string }>;

export function CheckEmailMessage({ email }: CheckEmailMessageProps) {
  // O primeiro link acabou de sair com o cadastro.
  const resendCountdown = useCountdown(RESEND_COOLDOWN_SECONDS);

  return (
    <PageMessage
      title={C.CHECK_EMAIL_TITLE}
      description={C.checkEmailDescription(email)}
      tone="info"
    >
      <ResendLinkButton
        email={email}
        send={resendConfirmationEmail}
        sentMessage={CONFIRMATION_LINK_RESENT}
        countdown={resendCountdown}
        variant="soft"
      />
      <SignInButton email={email} />
    </PageMessage>
  );
}
