import { useCallback, useState, type ReactNode } from 'react';

import { Button, Dialog } from '@design-system';

import { CONFIRMATION } from './constants';
import { LostItemConfirmTrigger } from './LostItemConfirmTrigger';
import * as S from './styles';

type LostItemConfirmActionProps = Readonly<{
  label: string;
  /** Sem ícone o gatilho é um botão com o rótulo à mostra. */
  icon?: ReactNode;
  dialogTitle: string;
  messagePrefix: string;
  itemName: string;
  confirmLabel: string;
  onConfirm: VoidFunction;
}>;

export function LostItemConfirmAction({
  label,
  icon,
  dialogTitle,
  messagePrefix,
  itemName,
  confirmLabel,
  onConfirm,
}: LostItemConfirmActionProps) {
  const [confirming, setConfirming] = useState(false);

  const handleAsk = useCallback(() => setConfirming(true), []);
  const handleCancel = useCallback(() => setConfirming(false), []);
  const handleConfirm = useCallback(() => {
    setConfirming(false);
    onConfirm();
  }, [onConfirm]);

  return (
    <>
      <LostItemConfirmTrigger label={label} icon={icon} onClick={handleAsk} />

      <Dialog open={confirming} onClose={handleCancel} title={dialogTitle}>
        <Dialog.Body>
          <S.ConfirmationMessage variant="subtitle">
            {messagePrefix}
            <strong>{itemName}</strong>
            {CONFIRMATION.messageSuffix}
          </S.ConfirmationMessage>
        </Dialog.Body>

        <Dialog.Footer>
          <Button type="button" variant="contained" color="primary" onClick={handleCancel}>
            {CONFIRMATION.cancelLabel}
          </Button>
          <Button type="button" variant="contained" color="secondary" onClick={handleConfirm}>
            {confirmLabel}
          </Button>
        </Dialog.Footer>
      </Dialog>
    </>
  );
}
