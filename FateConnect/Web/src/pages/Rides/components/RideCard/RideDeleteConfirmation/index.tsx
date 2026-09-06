import { useCallback, useState } from 'react';
import { Button, Dialog, IconButton } from '@design-system';
import { DeleteIcon } from '@design-system/icons';

import { RIDE_CARD_LABELS } from '@app/pages/Rides/constants';
import type { Ride } from '@app/services/rides/types';

import { DELETE_DIALOG } from './constants';
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
  const handleDismiss = useCallback(() => setConfirming(false), []);
  const handleConfirm = useCallback(() => {
    setConfirming(false);
    onDelete(ride);
  }, [onDelete, ride]);

  return (
    <>
      <IconButton type="button" label={RIDE_CARD_LABELS.delete} onClick={handleAsk}>
        <DeleteIcon />
      </IconButton>

      <Dialog open={confirming} onClose={handleDismiss} title={DELETE_DIALOG.title}>
        <Dialog.Body>
          <S.ConfirmationMessage variant="subtitle">
            {DELETE_DIALOG.messagePrefix}
            <strong>{ride.destination}</strong>
            {DELETE_DIALOG.messageSuffix}
          </S.ConfirmationMessage>
        </Dialog.Body>

        <Dialog.Footer>
          <Button type="button" variant="contained" color="primary" onClick={handleDismiss}>
            {DELETE_DIALOG.dismissLabel}
          </Button>
          <Button type="button" variant="contained" color="secondary" onClick={handleConfirm}>
            {DELETE_DIALOG.confirmLabel}
          </Button>
        </Dialog.Footer>
      </Dialog>
    </>
  );
}
