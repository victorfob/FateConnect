import type { ComponentProps } from 'react';
import { Button, Dialog } from '@design-system';

import * as C from './constants';

type ReportStatusDialogProps = Readonly<
  {
    open: boolean;
    title: string;
    onDismiss: VoidFunction;
    onConfirm: VoidFunction;
  } & Pick<ComponentProps<typeof Dialog.Message>, 'tone' | 'icon'>
>;

export function ReportStatusDialog({
  open,
  title,
  tone,
  icon,
  onDismiss,
  onConfirm,
}: ReportStatusDialogProps) {
  return (
    <Dialog open={open} onClose={onDismiss} title={title}>
      <Dialog.Body>
        <Dialog.Message tone={tone} icon={icon}>
          {C.STATUS_DIALOG.message}
        </Dialog.Message>
      </Dialog.Body>

      <Dialog.Footer>
        <Button type="button" variant="contained" color="primary" onClick={onDismiss}>
          {C.STATUS_DIALOG.dismissLabel}
        </Button>
        <Button type="button" variant="contained" color="secondary" onClick={onConfirm}>
          {C.STATUS_DIALOG.confirmLabel}
        </Button>
      </Dialog.Footer>
    </Dialog>
  );
}
