import { useCallback } from 'react';
import { IconButton, ListCard, StatusTag, Typography } from '@design-system';
import { AccessTimeIcon, CalendarTodayIcon, EditIcon, GroupsIcon } from '@design-system/icons';
import { format, parseISO } from 'date-fns';

import * as C from '@app/pages/Rides/constants';
import { rideTypeDisplayLabel, rideTypeTone } from '@app/pages/Rides/helpers/rideType';
import type { Ride } from '@app/services/rides/types';

import { RideDeleteConfirmation } from './RideDeleteConfirmation';
import { RideDriverContact } from './RideDriverContact';

const DATE_FORMAT = 'dd/MM/yyyy';
/** A API devolve `HH:mm:ss`; o cartão mostra só horas e minutos. */
const TIME_LENGTH = 5;

type RideCardProps = Readonly<{
  ride: Ride;
  onEdit: (ride: Ride) => void;
  onDelete: (ride: Ride) => void;
}>;

export function RideCard({ ride, onEdit, onDelete }: RideCardProps) {
  const handleEdit = useCallback(() => onEdit(ride), [onEdit, ride]);

  const typeLabel = rideTypeDisplayLabel(ride.tipoCarona);
  const tone = rideTypeTone(ride.tipoCarona);

  return (
    <ListCard>
      <ListCard.Header>
        <Typography variant="subtitleBold">{ride.destino}</Typography>

        <ListCard.Actions>
          <ListCard.WideOnlyTag>
            <StatusTag tone={tone}>{typeLabel}</StatusTag>
          </ListCard.WideOnlyTag>

          <ListCard.ActionButtons>
            <RideDriverContact destination={ride.destino} />

            <IconButton type="button" label={C.RIDE_CARD_LABELS.edit} onClick={handleEdit}>
              <EditIcon />
            </IconButton>

            <RideDeleteConfirmation ride={ride} onDelete={onDelete} />
          </ListCard.ActionButtons>
        </ListCard.Actions>
      </ListCard.Header>

      <ListCard.InfoRow>
        <ListCard.InfoItem>
          <CalendarTodayIcon />
          <Typography variant="caption" color="inherit">
            {format(parseISO(ride.dataPartida), DATE_FORMAT)}
          </Typography>
        </ListCard.InfoItem>

        <ListCard.InfoItem>
          <AccessTimeIcon />
          <Typography variant="caption" color="inherit">
            {ride.horaPartida.slice(0, TIME_LENGTH)}
          </Typography>
        </ListCard.InfoItem>

        <ListCard.InfoItem>
          <GroupsIcon />
          <Typography variant="caption" color="inherit">
            {C.seatsLabel(ride.qtdVagas)}
          </Typography>
        </ListCard.InfoItem>
      </ListCard.InfoRow>

      <ListCard.Description>
        <Typography variant="subtitle" color="inherit">
          {ride.descricao}
        </Typography>
      </ListCard.Description>

      <ListCard.CompactOnlyTag>
        <StatusTag tone={tone}>{typeLabel}</StatusTag>
      </ListCard.CompactOnlyTag>
    </ListCard>
  );
}
