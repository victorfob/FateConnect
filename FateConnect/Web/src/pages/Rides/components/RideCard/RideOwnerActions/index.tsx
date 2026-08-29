import { useCallback } from 'react';
import { IconButton } from '@design-system';
import { EditIcon } from '@design-system/icons';

import { RIDE_CARD_LABELS } from '@app/pages/Rides/constants';
import type { Ride } from '@app/services/rides/types';

import { RideDeleteConfirmation } from '../RideDeleteConfirmation';

type RideOwnerActionsProps = Readonly<{
  ride: Ride;
  onEdit: (ride: Ride) => void;
  onDelete: (ride: Ride) => void;
}>;

/**
 * Editar e excluir só existem para quem ofertou a carona. Esconder o botão é
 * conveniência, não regra: quem impede de verdade é a API, que responde 403 a
 * quem tenta mudar carona alheia.
 */
export function RideOwnerActions({ ride, onEdit, onDelete }: RideOwnerActionsProps) {
  const handleEdit = useCallback(() => onEdit(ride), [onEdit, ride]);

  if (!ride.isOwner) return null;

  return (
    <>
      <IconButton type="button" label={RIDE_CARD_LABELS.edit} onClick={handleEdit}>
        <EditIcon />
      </IconButton>

      <RideDeleteConfirmation ride={ride} onDelete={onDelete} />
    </>
  );
}
