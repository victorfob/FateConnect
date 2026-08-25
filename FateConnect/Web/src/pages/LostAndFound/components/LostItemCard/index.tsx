import { StatusTag, Typography } from '@design-system';
import { CalendarTodayIcon, ImageIcon, LocationOnIcon } from '@design-system/icons';
import { format, parseISO } from 'date-fns';

import {
  lostItemStatusLabel,
  lostItemStatusTone,
} from '@app/pages/LostAndFound/helpers/lostItemStatus';
import { LostItemStatusEnum, type LostItem } from '@app/services/lostAndFound/types';

import { LostItemActions } from './LostItemActions';
import { LostItemKindIcon } from './LostItemKindIcon';
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
    <S.CardRoot component="article" own={item.meuItem}>
      {item.meuItem && <S.ScreenReaderOnly component="span">{C.OWN_ITEM_LABEL}</S.ScreenReaderOnly>}

      {item.fotoUrl ? (
        <S.Photo component="img" src={item.fotoUrl} alt={C.photoAlt(item.nome)} />
      ) : (
        <S.PhotoPlaceholder aria-hidden>
          <ImageIcon />
        </S.PhotoPlaceholder>
      )}

      <S.CardBody>
        <S.HeaderRow>
          <Typography variant="subtitleBold">{item.nome}</Typography>

          <S.HeaderActions>
            <S.WideOnlyTag>
              <StatusTag tone={statusTone}>{statusLabel}</StatusTag>
            </S.WideOnlyTag>

            <LostItemActions item={item} onEdit={onEdit} onCancel={onCancel} />
          </S.HeaderActions>
        </S.HeaderRow>

        <S.InfoRow>
          <S.InfoItem>
            <LocationOnIcon />
            <Typography variant="caption" color="inherit">
              {item.local}
            </Typography>
          </S.InfoItem>

          <S.InfoItem>
            <CalendarTodayIcon />
            <Typography variant="caption" color="inherit">
              {format(parseISO(item.dataOcorrido), DATE_FORMAT)}
            </Typography>
          </S.InfoItem>

          <S.InfoItem>
            <LostItemKindIcon kind={item.tipo} />
            <Typography variant="caption" color="inherit">
              {item.tipo}
            </Typography>
          </S.InfoItem>
        </S.InfoRow>

        {item.descricao && (
          <S.Description>
            <Typography variant="subtitle" color="inherit">
              {item.descricao}
            </Typography>
          </S.Description>
        )}

        {item.situacao === LostItemStatusEnum.CANCELLED && (
          <S.CancellationNote>
            <Typography variant="caption" color="inherit">
              {C.cancellationNote(item.motivoCancelamento)}
            </Typography>
          </S.CancellationNote>
        )}

        <LostItemStatusAction item={item} onResolve={onResolve} onReopen={onReopen} />

        <S.CompactOnlyTag>
          <StatusTag tone={statusTone}>{statusLabel}</StatusTag>
        </S.CompactOnlyTag>
      </S.CardBody>
    </S.CardRoot>
  );
}
