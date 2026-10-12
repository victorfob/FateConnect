import { Button, Dialog } from '@design-system';
import { HelpOutlineOutlinedIcon } from '@design-system/icons';

import { REACTIVATION_DIALOG } from './constants';

type AccountReactivationDialogProps = Readonly<{
  open: boolean;
  reactivating: boolean;
  onDismiss: VoidFunction;
  onConfirm: VoidFunction;
}>;

export function AccountReactivationDialog({
  open,
  reactivating,
  onDismiss,
  onConfirm,
}: AccountReactivationDialogProps) {
  return (
    <Dialog open={open} onClose={onDismiss} title={REACTIVATION_DIALOG.title} width="narrow">
      <Dialog.Body>
        <Dialog.Message tone="info" icon={HelpOutlineOutlinedIcon}>
          {REACTIVATION_DIALOG.message}
        </Dialog.Message>
      </Dialog.Body>

      <Dialog.Footer>
        <Button type="button" variant="contained" color="primary" onClick={onDismiss}>
          {REACTIVATION_DIALOG.dismissLabel}
        </Button>
        <Button
          type="button"
          variant="contained"
          color="secondary"
          loading={reactivating}
          onClick={onConfirm}
        >
          {REACTIVATION_DIALOG.confirmLabel}
        </Button>
      </Dialog.Footer>
    </Dialog>
  );
}
