import { useCallback, useState, type ReactNode } from 'react';
import { Button, Dialog } from '@design-system';

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
  onConfirm: VoidFunction;
}>;

/** O botão de uma ação sem volta pela tela e a confirmação que ele abre. */
function ConfirmAction({
  label,
  icon,
  dialogTitle,
  messagePrefix,
  messageSuffix = CONFIRMATION.messageSuffix,
  subject,
  confirmLabel,
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
      <Button type="button" variant="soft" onClick={handleAsk}>
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
