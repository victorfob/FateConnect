import { ListCard, StatusTag, Typography } from '@design-system';
import { AccessTimeIcon, CalendarTodayIcon, GroupsIcon } from '@design-system/icons';
import { format, parseISO } from 'date-fns';

import * as C from '@app/pages/Rides/constants';
import { isOwnRide, RIDE_DRIVER } from '@app/pages/Rides/helpers/rideDriver';
import { rideTypeDisplayLabel, rideTypeTone } from '@app/pages/Rides/helpers/rideType';
import type { Ride } from '@app/services/rides/types';

import { RideDriverContact } from './RideDriverContact';
import { RideOwnerActions } from './RideOwnerActions';

const DATE_FORMAT = 'dd/MM/yyyy';
/** A API devolve `HH:mm:ss`; o cartão mostra só horas e minutos. */
const TIME_LENGTH = 5;

type RideCardProps = Readonly<{
  ride: Ride;
  onEdit: (ride: Ride) => void;
  onDelete: (ride: Ride) => void;
}>;

export function RideCard({ ride, onEdit, onDelete }: RideCardProps) {
  const typeLabel = rideTypeDisplayLabel(ride.rideType);
  const tone = rideTypeTone(ride.rideType);

  return (
    <ListCard own={isOwnRide(RIDE_DRIVER)} ownLabel={C.OWN_RIDE_LABEL}>
      <ListCard.Header>
        <Typography variant="subtitleBold">{ride.destination}</Typography>

        <ListCard.Actions>
          <StatusTag tone={tone}>{typeLabel}</StatusTag>

          <ListCard.ActionButtons>
            <RideDriverContact destination={ride.destination} />

            <RideOwnerActions ride={ride} onEdit={onEdit} onDelete={onDelete} />
          </ListCard.ActionButtons>
        </ListCard.Actions>
      </ListCard.Header>

      <ListCard.InfoRow>
        <ListCard.InfoItem>
          <CalendarTodayIcon />
          <Typography variant="caption" color="inherit">
            {format(parseISO(ride.departureDate), DATE_FORMAT)}
          </Typography>
        </ListCard.InfoItem>

        <ListCard.InfoItem>
          <AccessTimeIcon />
          <Typography variant="caption" color="inherit">
            {ride.departureTime.slice(0, TIME_LENGTH)}
          </Typography>
        </ListCard.InfoItem>

        <ListCard.InfoItem>
          <GroupsIcon />
          <Typography variant="caption" color="inherit">
            {C.seatsLabel(ride.availableSeats)}
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
