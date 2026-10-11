import { PageMessage } from '@design-system';

import { ResendConfirmationButton } from '@app/components/ResendConfirmationButton';
import { RESEND_COOLDOWN_SECONDS } from '@app/components/ResendConfirmationButton/constants';
import { SignInButton } from '@app/components/SignInButton';
import { useCountdown } from '@app/hooks/useCountdown';

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
      <ResendConfirmationButton email={email} countdown={resendCountdown} variant="soft" />
      <SignInButton email={email} />
    </PageMessage>
  );
}
