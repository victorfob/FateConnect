import { Button, Dialog } from '@design-system';

import { UNSAVED_CHANGES } from './constants';

export type UnsavedChangesDialogProps = Readonly<{
  open: boolean;
  /** Diz o que se perde ao sair, com o nome da tela. */
  message: string;
  onCancel: VoidFunction;
  onDiscard: VoidFunction;
}>;

export function UnsavedChangesDialog({
  open,
  message,
  onCancel,
  onDiscard,
}: UnsavedChangesDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel} title={UNSAVED_CHANGES.title}>
      <Dialog.Body>
        <Dialog.Message>{message}</Dialog.Message>
      </Dialog.Body>

      <Dialog.Footer>
        <Button type="button" variant="contained" color="primary" onClick={onCancel}>
          {UNSAVED_CHANGES.cancel}
        </Button>
        <Button type="button" variant="contained" color="secondary" onClick={onDiscard}>
          {UNSAVED_CHANGES.discard}
        </Button>
      </Dialog.Footer>
    </Dialog>
  );
}
