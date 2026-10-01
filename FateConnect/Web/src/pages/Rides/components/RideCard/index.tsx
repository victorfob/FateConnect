import { ListCard, StatusTag, Typography } from '@design-system';
import {
  CalendarTodayIcon,
  DirectionsCarIcon,
  EventRepeatIcon,
  TwoWheelerIcon,
} from '@design-system/icons';

import * as C from '@app/pages/Rides/constants';
import { rideDepartureLabel } from '@app/pages/Rides/helpers/rideDeparture';
import { rideRecurrenceLabel } from '@app/pages/Rides/helpers/rideFrequency';
import { rideTypeDisplayLabel, rideTypeTone } from '@app/pages/Rides/helpers/rideType';
import { vehicleTypeLabel } from '@app/pages/Rides/helpers/rideVehicle';
import { VehicleTypeEnum, type Ride } from '@app/services/rides/types';

import { RideDriverContact } from './RideDriverContact';
import { RideOwnerActions } from './RideOwnerActions';

type RideCardProps = Readonly<{
  ride: Ride;
  onEdit: (ride: Ride) => void;
  onDelete: (ride: Ride) => void;
}>;

export function RideCard({ ride, onEdit, onDelete }: RideCardProps) {
  const typeLabel = rideTypeDisplayLabel(ride.rideType);
  const tone = rideTypeTone(ride.rideType);
  const recurrence = rideRecurrenceLabel(ride.frequency, ride.departureDate);
  const departure = rideDepartureLabel(ride.departureDate, ride.departureTime, ride.frequency);

  return (
    <ListCard own={ride.isOwner} ownLabel={C.OWN_RIDE_LABEL}>
      <ListCard.Header>
        <Typography variant="subtitleBold">{ride.destination}</Typography>

        <ListCard.Actions>
          <StatusTag tone={tone}>{typeLabel}</StatusTag>

          <ListCard.ActionButtons>
            <RideDriverContact ride={ride} />

            <RideOwnerActions ride={ride} onEdit={onEdit} onDelete={onDelete} />
          </ListCard.ActionButtons>
        </ListCard.Actions>
      </ListCard.Header>

      <ListCard.InfoRow>
        <ListCard.InfoItem>
          <CalendarTodayIcon />
          <Typography variant="caption" color="inherit">
            {departure}
          </Typography>
        </ListCard.InfoItem>

        {recurrence && (
          <ListCard.InfoItem>
            <EventRepeatIcon />
            <Typography variant="caption" color="inherit">
              {recurrence}
            </Typography>
          </ListCard.InfoItem>
        )}

        <ListCard.InfoItem>
          {ride.vehicleType === VehicleTypeEnum.MOTORCYCLE ? (
            <TwoWheelerIcon />
          ) : (
            <DirectionsCarIcon />
          )}
          <Typography variant="caption" color="inherit">
            {vehicleTypeLabel(ride.vehicleType)}
          </Typography>
        </ListCard.InfoItem>
      </ListCard.InfoRow>

      <ListCard.Description>
        <Typography variant="subtitle" color="inherit">
          {ride.description}
        </Typography>
      </ListCard.Description>
    </ListCard>
  );
}
