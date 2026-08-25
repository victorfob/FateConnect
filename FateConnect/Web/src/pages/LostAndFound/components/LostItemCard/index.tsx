import { ListCard, StatusTag, Typography } from '@design-system';
import { CalendarTodayIcon, LocationOnIcon } from '@design-system/icons';
import { format, parseISO } from 'date-fns';

import {
  lostItemStatusLabel,
  lostItemStatusTone,
} from '@app/pages/LostAndFound/helpers/lostItemStatus';
import { LostItemStatusEnum, type LostItem } from '@app/services/lostAndFound/types';

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
  onCancel: (item: LostItem) => void;
  onReopen: (item: LostItem) => void;
}>;

export function LostItemCard({ item, onEdit, onResolve, onCancel, onReopen }: LostItemCardProps) {
  const statusTone = lostItemStatusTone(item.situacao);
  const statusLabel = lostItemStatusLabel(item.situacao);

  return (
    <ListCard
      own={item.meuItem}
      ownLabel={C.OWN_ITEM_LABEL}
      media={<LostItemPhoto url={item.fotoUrl} itemName={item.nome} />}
    >
      <ListCard.Header>
        <Typography variant="subtitleBold">{item.nome}</Typography>

        <ListCard.Actions>
          <ListCard.WideOnlyTag>
            <StatusTag tone={statusTone}>{statusLabel}</StatusTag>
          </ListCard.WideOnlyTag>

          <LostItemActions item={item} onEdit={onEdit} onCancel={onCancel} />
        </ListCard.Actions>
      </ListCard.Header>

      <ListCard.InfoRow>
        <ListCard.InfoItem>
          <LocationOnIcon />
          <Typography variant="caption" color="inherit">
            {item.local}
          </Typography>
        </ListCard.InfoItem>

        <ListCard.InfoItem>
          <CalendarTodayIcon />
          <Typography variant="caption" color="inherit">
            {format(parseISO(item.dataOcorrido), DATE_FORMAT)}
          </Typography>
        </ListCard.InfoItem>

        <ListCard.InfoItem>
          <LostItemKindIcon kind={item.tipo} />
          <Typography variant="caption" color="inherit">
            {item.tipo}
          </Typography>
        </ListCard.InfoItem>
      </ListCard.InfoRow>

      {item.descricao && (
        <ListCard.Description>
          <Typography variant="subtitle" color="inherit">
            {item.descricao}
          </Typography>
        </ListCard.Description>
      )}

      {item.situacao === LostItemStatusEnum.CANCELLED && (
        <S.CancellationNote>
          <Typography variant="caption" color="inherit">
            {C.cancellationNote(item.motivoCancelamento)}
          </Typography>
        </S.CancellationNote>
      )}

      <LostItemStatusAction item={item} onResolve={onResolve} onReopen={onReopen} />

      <ListCard.CompactOnlyTag>
        <StatusTag tone={statusTone}>{statusLabel}</StatusTag>
      </ListCard.CompactOnlyTag>
    </ListCard>
  );
}
