import { ContactButton } from '@app/components/ContactButton';
import { isOwnRide, RIDE_DRIVER } from '@app/pages/Rides/helpers/rideDriver';

import { contactMessage } from './constants';

type RideDriverContactProps = Readonly<{ destination: string }>;

export function RideDriverContact({ destination }: RideDriverContactProps) {
  if (isOwnRide(RIDE_DRIVER)) return null;

  return <ContactButton contact={RIDE_DRIVER} message={contactMessage(destination)} />;
}
