import { useCallback, useState } from 'react';
import { Button, Dialog, IconButton } from '@design-system';
import { DeleteIcon } from '@design-system/icons';

import { RIDE_CARD_LABELS } from '@app/pages/Rides/constants';
import type { Ride } from '@app/services/rides/types';

import { CANCEL_DIALOG } from './constants';
import * as S from './styles';

type RideCancelConfirmationProps = Readonly<{
  ride: Ride;
  onCancel: (ride: Ride) => void;
}>;

/**
 * Cancelamento de uma carona: o botão no cartão e a confirmação que ele abre. Nada
 * sai sem passar por aqui, porque a ação não tem volta.
 */
export function RideCancelConfirmation({ ride, onCancel }: RideCancelConfirmationProps) {
  const [confirming, setConfirming] = useState(false);

  const handleAsk = useCallback(() => setConfirming(true), []);
  const handleDismiss = useCallback(() => setConfirming(false), []);
  const handleConfirm = useCallback(() => {
    setConfirming(false);
    onCancel(ride);
  }, [onCancel, ride]);

  return (
    <>
      <IconButton type="button" label={RIDE_CARD_LABELS.cancel} onClick={handleAsk}>
        <DeleteIcon />
      </IconButton>

      <Dialog open={confirming} onClose={handleDismiss} title={CANCEL_DIALOG.title}>
        <Dialog.Body>
          <S.ConfirmationMessage variant="subtitle">
            {CANCEL_DIALOG.messagePrefix}
            <strong>{ride.destination}</strong>
            {CANCEL_DIALOG.messageSuffix}
          </S.ConfirmationMessage>
        </Dialog.Body>

        <Dialog.Footer>
          <Button type="button" variant="contained" color="primary" onClick={handleDismiss}>
            {CANCEL_DIALOG.dismissLabel}
          </Button>
          <Button type="button" variant="contained" color="secondary" onClick={handleConfirm}>
            {CANCEL_DIALOG.confirmLabel}
          </Button>
        </Dialog.Footer>
      </Dialog>
    </>
  );
}
