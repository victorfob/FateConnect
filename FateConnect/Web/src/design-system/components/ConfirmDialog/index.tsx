import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

import { DialogMessage } from './DialogMessage';
import * as S from './styles';

const DEFAULT_TITLE = 'Confirmar ação';
const DEFAULT_CONFIRM = 'Confirmar';
const DEFAULT_CANCEL = 'Cancelar';
const TITLE_ID = 'confirm-dialog-title';

export type ConfirmDialogProps = Readonly<{
  open: boolean;
  onCancel: VoidFunction;
  onConfirm: VoidFunction;
  /** Corpo da confirmação — normalmente um `ConfirmDialog.Message`. */
  children: ReactNode;
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}>;

/**
 * Confirmação de ação destrutiva. Prop-driven: quem abre decide os textos e o
 * que acontece — o diálogo não conhece o domínio.
 */
function ConfirmDialog({
  open,
  onCancel,
  onConfirm,
  children,
  title = DEFAULT_TITLE,
  confirmLabel = DEFAULT_CONFIRM,
  cancelLabel = DEFAULT_CANCEL,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel} aria-labelledby={TITLE_ID}>
      <S.DialogRoot>
        <S.Content>
          <Typography variant="h2" id={TITLE_ID}>
            {title}
          </Typography>
          {children}
        </S.Content>

        <S.Actions>
          <Button type="button" variant="contained" color="primary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button type="button" variant="contained" color="secondary" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </S.Actions>
      </S.DialogRoot>
    </Dialog>
  );
}

ConfirmDialog.Message = DialogMessage;

export { ConfirmDialog };
