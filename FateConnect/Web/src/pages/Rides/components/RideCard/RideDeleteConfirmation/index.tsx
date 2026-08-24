import { useCallback, useState } from 'react';

import * as C from '@app/pages/Rides/constants';
import type { Ride } from '@app/services/rides/types';
import { Button, Dialog, IconButton } from '@design-system';
import { DeleteIcon } from '@design-system/icons';

import * as S from './styles';

type RideDeleteConfirmationProps = Readonly<{
  ride: Ride;
  onDelete: (ride: Ride) => void;
}>;

/**
 * Exclusão de uma carona: o botão no cartão e a confirmação que ele abre. Nada
 * sai sem passar por aqui, porque a ação não tem volta.
 */
export function RideDeleteConfirmation({ ride, onDelete }: RideDeleteConfirmationProps) {
  const [confirming, setConfirming] = useState(false);

  const handleAsk = useCallback(() => setConfirming(true), []);
  const handleCancel = useCallback(() => setConfirming(false), []);
  const handleConfirm = useCallback(() => {
    setConfirming(false);
    onDelete(ride);
  }, [onDelete, ride]);

  return (
    <>
      <IconButton type="button" aria-label={C.RIDE_CARD_LABELS.delete} onClick={handleAsk}>
        <DeleteIcon />
      </IconButton>

      <Dialog open={confirming} onClose={handleCancel} title={C.DELETE_DIALOG.title}>
        <Dialog.Body>
          <S.ConfirmationMessage variant="subtitle">
            {C.DELETE_DIALOG.messagePrefix}
            <strong>{ride.destino}</strong>
            {C.DELETE_DIALOG.messageSuffix}
          </S.ConfirmationMessage>
        </Dialog.Body>

        <Dialog.Footer>
          <Button type="button" variant="contained" color="primary" onClick={handleCancel}>
            {C.DELETE_DIALOG.cancelLabel}
          </Button>
          <Button type="button" variant="contained" color="secondary" onClick={handleConfirm}>
            {C.DELETE_DIALOG.confirmLabel}
          </Button>
        </Dialog.Footer>
      </Dialog>
    </>
  );
}
