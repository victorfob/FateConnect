import { format, parseISO } from 'date-fns';

import {
  lostItemStatusLabel,
  lostItemStatusTone,
} from '@app/pages/LostAndFound/helpers/lostItemStatus';
import type { LostItem } from '@app/services/lostAndFound/types';
import { StatusTag, Typography } from '@design-system';
import { CalendarTodayIcon, ImageIcon, LocationOnIcon } from '@design-system/icons';

import { LostItemKindIcon } from './LostItemKindIcon';
import * as C from './constants';
import * as S from './styles';

const DATE_FORMAT = 'dd/MM/yyyy';

type LostItemCardProps = Readonly<{ item: LostItem }>;

export function LostItemCard({ item }: LostItemCardProps) {
  const statusTone = lostItemStatusTone(item.situacao);
  const statusLabel = lostItemStatusLabel(item.situacao);

  return (
    <S.CardRoot component="article" own={item.meuItem}>
      {item.meuItem && <S.ScreenReaderOnly>{C.OWN_ITEM_LABEL}</S.ScreenReaderOnly>}

      {item.fotoUrl ? (
        <S.Photo src={item.fotoUrl} alt={C.photoAlt(item.nome)} />
      ) : (
        <S.PhotoPlaceholder aria-hidden>
          <ImageIcon />
        </S.PhotoPlaceholder>
      )}

      <S.CardBody>
        <S.HeaderRow>
          <Typography variant="subtitleBold">{item.nome}</Typography>

          <S.WideOnlyTag>
            <StatusTag tone={statusTone}>{statusLabel}</StatusTag>
          </S.WideOnlyTag>
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

        <S.CompactOnlyTag>
          <StatusTag tone={statusTone}>{statusLabel}</StatusTag>
        </S.CompactOnlyTag>
      </S.CardBody>
    </S.CardRoot>
  );
}
