import { useCallback, useState, type ReactNode } from 'react';
import { Button, Dialog, type ButtonProps } from '@design-system';

import { CONFIRMATION } from './constants';
import * as S from './styles';

export type ConfirmActionProps = Readonly<{
  label: string;
  icon: ReactNode;
  dialogTitle: string;
  messagePrefix: string;
  /** Fecha a frase depois do nome em destaque, para quem precisa dizer mais que o `?`. */
  messageSuffix?: string;
  subject: string;
  confirmLabel: string;
  /** Pinta o gatilho de vermelho, para a ação que desfaz algo que não volta pela tela. */
  destructive?: boolean;
  onConfirm: VoidFunction;
}>;

function triggerVariant(destructive: boolean): ButtonProps['variant'] {
  if (destructive) return 'destructive';

  return 'soft';
}

/** O botão de uma ação sem volta pela tela e a confirmação que ele abre. */
function ConfirmAction({
  label,
  icon,
  dialogTitle,
  messagePrefix,
  messageSuffix = CONFIRMATION.messageSuffix,
  subject,
  confirmLabel,
  destructive = false,
  onConfirm,
}: ConfirmActionProps) {
  const [confirming, setConfirming] = useState(false);

  const handleAsk = useCallback(() => setConfirming(true), []);
  const handleDismiss = useCallback(() => setConfirming(false), []);
  const handleConfirm = useCallback(() => {
    setConfirming(false);
    onConfirm();
  }, [onConfirm]);

  return (
    <>
      <Button type="button" variant={triggerVariant(destructive)} onClick={handleAsk}>
        {icon}
        {label}
      </Button>

      <Dialog open={confirming} onClose={handleDismiss} title={dialogTitle}>
        <Dialog.Body>
          <Dialog.Message>
            {messagePrefix}
            <strong>{subject}</strong>
            {messageSuffix}
          </Dialog.Message>
        </Dialog.Body>

        <Dialog.Footer>
          <Button type="button" variant="contained" color="primary" onClick={handleDismiss}>
            {CONFIRMATION.dismissLabel}
          </Button>
          <Button type="button" variant="contained" color="secondary" onClick={handleConfirm}>
            {confirmLabel}
          </Button>
        </Dialog.Footer>
      </Dialog>
    </>
  );
}

ConfirmAction.Row = S.ActionRow;

export { ConfirmAction };
