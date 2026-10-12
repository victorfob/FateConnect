import { Button, Dialog } from '@design-system';
import { MarkEmailUnreadOutlinedIcon } from '@design-system/icons';

import { ResendLinkButton } from '@app/components/ResendLinkButton';
import { CONFIRMATION_LINK_RESENT } from '@app/constants/emailLink';
import type { Countdown } from '@app/hooks/useCountdown';
import { resendConfirmationEmail } from '@app/services/auth/authService';

import { EMAIL_NOT_CONFIRMED_DIALOG } from './constants';

type EmailNotConfirmedDialogProps = Readonly<{
  open: boolean;
  email: string;
  resendCountdown: Countdown;
  onClose: VoidFunction;
}>;

export function EmailNotConfirmedDialog({
  open,
  email,
  resendCountdown,
  onClose,
}: EmailNotConfirmedDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title={EMAIL_NOT_CONFIRMED_DIALOG.title} width="narrow">
      <Dialog.Body>
        <Dialog.Message tone="info" icon={MarkEmailUnreadOutlinedIcon}>
          {EMAIL_NOT_CONFIRMED_DIALOG.message}
        </Dialog.Message>
      </Dialog.Body>

      <Dialog.Footer>
        <Button type="button" variant="contained" color="primary" onClick={onClose}>
          {EMAIL_NOT_CONFIRMED_DIALOG.closeLabel}
        </Button>
        <ResendLinkButton
          email={email}
          send={resendConfirmationEmail}
          sentMessage={CONFIRMATION_LINK_RESENT}
          countdown={resendCountdown}
        />
      </Dialog.Footer>
    </Dialog>
  );
}
