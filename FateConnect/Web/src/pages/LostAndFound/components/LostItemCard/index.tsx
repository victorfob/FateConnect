import { ListCard, StatusTag, Typography } from '@design-system';
import { CalendarTodayIcon, LocationOnIcon } from '@design-system/icons';
import { format, parseISO } from 'date-fns';

import { lostItemKindLabel } from '@app/pages/LostAndFound/helpers/lostItemKind';
import {
  lostItemStatusLabel,
  lostItemStatusTone,
} from '@app/pages/LostAndFound/helpers/lostItemStatus';
import type { LostItem } from '@app/services/lostAndFound/types';

import { LostItemActions } from './LostItemActions';
import { LostItemKindIcon } from './LostItemKindIcon';
import { LostItemPhoto } from './LostItemPhoto';
import { LostItemStatusAction } from './LostItemStatusAction';
import * as C from './constants';
import * as S from './styles';

const DATE_FORMAT = 'dd/MM/yyyy';

type LostItemCardProps = Readonly<{
  item: LostItem;
  onEdit?: (item: LostItem) => void;
  onResolve: (item: LostItem) => void;
  onDelete: (item: LostItem) => void;
  onRestore: (item: LostItem) => void;
}>;

export function LostItemCard({ item, onEdit, onResolve, onDelete, onRestore }: LostItemCardProps) {
  const statusTone = lostItemStatusTone(item.status);
  const statusLabel = lostItemStatusLabel(item.status);
  const deletionNote = C.deletionNote(item.deletionReason);

  return (
    <ListCard
      own={item.isMine}
      ownLabel={C.OWN_ITEM_LABEL}
      media={<LostItemPhoto url={item.photoUrl} itemName={item.name} />}
    >
      <ListCard.Header>
        <Typography variant="subtitleBold">{item.name}</Typography>

        <ListCard.Actions>
          <StatusTag tone={statusTone}>{statusLabel}</StatusTag>

          <LostItemActions item={item} onEdit={onEdit} onDelete={onDelete} />
        </ListCard.Actions>
      </ListCard.Header>

      <ListCard.InfoRow>
        <ListCard.InfoItem>
          <LocationOnIcon />
          <Typography variant="caption" color="inherit">
            {item.place}
          </Typography>
        </ListCard.InfoItem>

        <ListCard.InfoItem>
          <CalendarTodayIcon />
          <Typography variant="caption" color="inherit">
            {format(parseISO(item.occurredOn), DATE_FORMAT)}
          </Typography>
        </ListCard.InfoItem>

        <ListCard.InfoItem>
          <LostItemKindIcon kind={item.type} />
          <Typography variant="caption" color="inherit">
            {lostItemKindLabel(item.type)}
          </Typography>
        </ListCard.InfoItem>
      </ListCard.InfoRow>

      {item.description && (
        <ListCard.Description>
          <Typography variant="subtitle" color="inherit">
            {item.description}
          </Typography>
        </ListCard.Description>
      )}

      {deletionNote && (
        <S.DeletionNote>
          <Typography variant="caption" color="inherit">
            {deletionNote}
          </Typography>
        </S.DeletionNote>
      )}

      <LostItemStatusAction item={item} onResolve={onResolve} onRestore={onRestore} />
    </ListCard>
  );
}
