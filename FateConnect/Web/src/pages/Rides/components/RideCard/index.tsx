import { ListCard, StatusTag, Typography } from '@design-system';
import { AccessTimeIcon, CalendarTodayIcon, GroupsIcon } from '@design-system/icons';
import { format, parseISO } from 'date-fns';

import * as C from '@app/pages/Rides/constants';
import { rideTypeDisplayLabel, rideTypeTone } from '@app/pages/Rides/helpers/rideType';
import type { Ride } from '@app/services/rides/types';
import { firstCharacters } from '@app/utils/sequence';

import { RideDriverContact } from './RideDriverContact';
import { RideOwnerActions } from './RideOwnerActions';

const DATE_FORMAT = 'dd/MM/yyyy';
/** A API devolve `HH:mm:ss`; o cartão mostra só horas e minutos. */
const TIME_LENGTH = 5;

type RideCardProps = Readonly<{
  ride: Ride;
  onEdit: (ride: Ride) => void;
  onCancel: (ride: Ride) => void;
}>;

export function RideCard({ ride, onEdit, onCancel }: RideCardProps) {
  const typeLabel = rideTypeDisplayLabel(ride.rideType);
  const tone = rideTypeTone(ride.rideType);

  return (
    <ListCard own={ride.isOwner} ownLabel={C.OWN_RIDE_LABEL}>
      <ListCard.Header>
        <Typography variant="subtitleBold">{ride.destination}</Typography>

        <ListCard.Actions>
          <StatusTag tone={tone}>{typeLabel}</StatusTag>

          <ListCard.ActionButtons>
            <RideDriverContact ride={ride} />

            <RideOwnerActions ride={ride} onEdit={onEdit} onCancel={onCancel} />
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
            {firstCharacters(ride.departureTime, TIME_LENGTH)}
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
