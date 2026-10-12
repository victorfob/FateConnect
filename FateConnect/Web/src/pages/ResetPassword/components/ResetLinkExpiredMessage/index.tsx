import { PageMessage } from '@design-system';

import { ResendLinkButton } from '@app/components/ResendLinkButton';
import { SignInButton } from '@app/components/SignInButton';
import { RESET_LINK_RESENT } from '@app/constants/emailLink';
import { useCountdown } from '@app/hooks/useCountdown';
import { forgotPassword } from '@app/services/auth/authService';

import { RESET_LINK_EXPIRED_MESSAGE } from './constants';

type ResetLinkExpiredMessageProps = Readonly<{ email: string }>;

export function ResetLinkExpiredMessage({ email }: ResetLinkExpiredMessageProps) {
  const resendCountdown = useCountdown();

  return (
    <PageMessage
      title={RESET_LINK_EXPIRED_MESSAGE.title}
      description={RESET_LINK_EXPIRED_MESSAGE.description}
      tone="warning"
    >
      <SignInButton email={email} variant="soft" />
      {email && (
        <ResendLinkButton
          email={email}
          send={forgotPassword}
          sentMessage={RESET_LINK_RESENT}
          countdown={resendCountdown}
        />
      )}
    </PageMessage>
  );
}
