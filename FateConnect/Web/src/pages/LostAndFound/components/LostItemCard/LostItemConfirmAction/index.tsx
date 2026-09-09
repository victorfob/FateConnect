import { useCallback, useState, type ReactNode } from 'react';
import { Button, Dialog } from '@design-system';

import { CONFIRMATION } from './constants';
import { LostItemConfirmTrigger } from './LostItemConfirmTrigger';
import * as S from './styles';

type LostItemConfirmActionProps = Readonly<{
  label: string;
  icon: ReactNode;
  /** Sem rótulo à mostra: o nome do botão fica no tooltip. */
  iconOnly?: boolean;
  dialogTitle: string;
  messagePrefix: string;
  /** Fecha a frase depois do nome do item, para quem precisa dizer mais que o `?`. */
  messageSuffix?: string;
  itemName: string;
  confirmLabel: string;
  onConfirm: VoidFunction;
}>;

export function LostItemConfirmAction({
  label,
  icon,
  iconOnly,
  dialogTitle,
  messagePrefix,
  messageSuffix = CONFIRMATION.messageSuffix,
  itemName,
  confirmLabel,
  onConfirm,
}: LostItemConfirmActionProps) {
  const [confirming, setConfirming] = useState(false);

  const handleAsk = useCallback(() => setConfirming(true), []);
  const handleDismiss = useCallback(() => setConfirming(false), []);
  const handleConfirm = useCallback(() => {
    setConfirming(false);
    onConfirm();
  }, [onConfirm]);

  return (
    <>
      <LostItemConfirmTrigger label={label} icon={icon} iconOnly={iconOnly} onClick={handleAsk} />

      <Dialog open={confirming} onClose={handleDismiss} title={dialogTitle}>
        <Dialog.Body>
          <S.ConfirmationMessage variant="subtitle">
            {messagePrefix}
            <strong>{itemName}</strong>
            {messageSuffix}
          </S.ConfirmationMessage>
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
