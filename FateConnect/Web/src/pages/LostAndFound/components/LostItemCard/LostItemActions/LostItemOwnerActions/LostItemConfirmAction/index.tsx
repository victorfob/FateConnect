import { useCallback, useState, type ReactNode } from 'react';

import { Button, Dialog, IconButton } from '@design-system';

import { CONFIRMATION } from '../../constants';
import * as S from './styles';

type LostItemConfirmActionProps = Readonly<{
  label: string;
  icon: ReactNode;
  dialogTitle: string;
  messagePrefix: string;
  itemName: string;
  confirmLabel: string;
  onConfirm: VoidFunction;
}>;

/** Botão do cartão que só executa depois do sim, para o que não tem volta. */
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
      <IconButton type="button" aria-label={label} onClick={handleAsk}>
        {icon}
      </IconButton>

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
