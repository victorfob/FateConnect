import { ContactButton } from '@app/components/ContactButton';
import type { Ride } from '@app/services/rides/types';

import { contactMessage } from './constants';

type RideDriverContactProps = Readonly<{ ride: Ride }>;

export function RideDriverContact({ ride }: RideDriverContactProps) {
  if (ride.isOwner) return null;

  return <ContactButton contact={ride.driver} message={contactMessage(ride.destination)} />;
}
