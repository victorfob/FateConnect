import { format, parseISO } from 'date-fns';
import { useCallback, useState } from 'react';

import type { Ride } from '@app/services/rides/types';
import { ConfirmDialog, IconButton, StatusTag, Typography } from '@design-system';
import {
  AccessTimeIcon,
  CalendarTodayIcon,
  DeleteIcon,
  EditIcon,
  GroupsIcon,
} from '@design-system/icons';

import * as C from '../../constants';
import { rideTypeDisplayLabel, rideTypeTone } from '../../helpers/rideType';
import * as S from './styles';

const DATE_FORMAT = 'dd/MM/yyyy';
/** A API devolve `HH:mm:ss`; o cartão mostra só horas e minutos. */
const TIME_LENGTH = 5;

type RideCardProps = Readonly<{
  ride: Ride;
  onEdit: (ride: Ride) => void;
  onDelete: (ride: Ride) => void;
}>;

export function RideCard({ ride, onEdit, onDelete }: RideCardProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const handleEdit = useCallback(() => onEdit(ride), [onEdit, ride]);
  const handleAskDelete = useCallback(() => setConfirmingDelete(true), []);
  const handleCancelDelete = useCallback(() => setConfirmingDelete(false), []);
  const handleConfirmDelete = useCallback(() => {
    setConfirmingDelete(false);
    onDelete(ride);
  }, [onDelete, ride]);

  const typeLabel = rideTypeDisplayLabel(ride.tipoCarona);
  const tone = rideTypeTone(ride.tipoCarona);

  return (
    <S.CardRoot component="article">
      <S.HeaderRow>
        <Typography variant="subtitleBold">{ride.destino}</Typography>

        <S.HeaderActions>
          <S.WideOnlyTag>
            <StatusTag tone={tone}>{typeLabel}</StatusTag>
          </S.WideOnlyTag>

          <S.ActionButtons>
            <IconButton type="button" aria-label={C.RIDE_CARD_LABELS.edit} onClick={handleEdit}>
              <EditIcon />
            </IconButton>
            <IconButton
              type="button"
              aria-label={C.RIDE_CARD_LABELS.delete}
              onClick={handleAskDelete}
            >
              <DeleteIcon />
            </IconButton>
          </S.ActionButtons>
        </S.HeaderActions>
      </S.HeaderRow>

      <S.InfoRow>
        <S.InfoItem>
          <CalendarTodayIcon />
          <Typography variant="caption" color="inherit">
            {format(parseISO(ride.dataPartida), DATE_FORMAT)}
          </Typography>
        </S.InfoItem>

        <S.InfoItem>
          <AccessTimeIcon />
          <Typography variant="caption" color="inherit">
            {ride.horaPartida.slice(0, TIME_LENGTH)}
          </Typography>
        </S.InfoItem>

        <S.InfoItem>
          <GroupsIcon />
          <Typography variant="caption" color="inherit">
            {C.seatsLabel(ride.qtdVagas)}
          </Typography>
        </S.InfoItem>
      </S.InfoRow>

      <S.Description>
        <Typography variant="subtitle" color="inherit">
          {ride.descricao}
        </Typography>
      </S.Description>

      <S.CompactOnlyTag>
        <StatusTag tone={tone}>{typeLabel}</StatusTag>
      </S.CompactOnlyTag>

      <ConfirmDialog
        open={confirmingDelete}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={C.DELETE_DIALOG.title}
        confirmLabel={C.DELETE_DIALOG.confirmLabel}
        cancelLabel={C.DELETE_DIALOG.cancelLabel}
      >
        <ConfirmDialog.Message
          prefix={C.DELETE_DIALOG.messagePrefix}
          emphasis={ride.destino}
          suffix={C.DELETE_DIALOG.messageSuffix}
        />
      </ConfirmDialog>
    </S.CardRoot>
  );
}
