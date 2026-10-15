import { useCallback } from 'react';

import { PublicationRemoval } from '@app/components/PublicationRemoval';
import { RIDE_LIST_MESSAGES, RIDES_QUERY_KEY } from '@app/pages/Rides/constants';
import { loggedUserIsAdministrator } from '@app/services/auth/loggedUser';
import type { RemovalReasonEnum } from '@app/services/moderation/types';
import { removeRide } from '@app/services/rides/ridesService';
import type { Ride } from '@app/services/rides/types';

import * as C from './constants';

type RideAdminRemovalProps = Readonly<{ ride: Ride }>;

const REMOVAL_MESSAGES = {
  succeeded: RIDE_LIST_MESSAGES.deleteSucceeded,
  failed: RIDE_LIST_MESSAGES.deleteFailed,
};

/** A carona da própria pessoa sai pela lixeira de quem ofertou, sem motivo nem aviso. */
export function RideAdminRemoval({ ride }: RideAdminRemovalProps) {
  const handleRemove = useCallback(
    (reason: RemovalReasonEnum) => removeRide(ride.id, reason),
    [ride.id],
  );

  if (ride.isOwner || !loggedUserIsAdministrator()) return null;

  return (
    <PublicationRemoval
      remove={handleRemove}
      queryKey={RIDES_QUERY_KEY}
      messages={REMOVAL_MESSAGES}
    >
      {C.REMOVAL_MESSAGE.prefix}
      <strong>{ride.destination}</strong>
      {C.REMOVAL_MESSAGE.suffix}
    </PublicationRemoval>
  );
}
