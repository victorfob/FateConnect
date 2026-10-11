import { Button, Dialog } from '@design-system';

import { ACCOUNT_LOCKED_DIALOG, lockedAccountMessage } from './constants';

type AccountLockedDialogProps = Readonly<{
  open: boolean;
  minutesRemaining: number | undefined;
  onClose: VoidFunction;
}>;

export function AccountLockedDialog({ open, minutesRemaining, onClose }: AccountLockedDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title={ACCOUNT_LOCKED_DIALOG.title} width="narrow">
      <Dialog.Body>
        <Dialog.Message>{lockedAccountMessage(minutesRemaining)}</Dialog.Message>
      </Dialog.Body>

      <Dialog.Footer>
        <Button type="button" variant="contained" color="primary" onClick={onClose}>
          {ACCOUNT_LOCKED_DIALOG.closeLabel}
        </Button>
      </Dialog.Footer>
    </Dialog>
  );
}
