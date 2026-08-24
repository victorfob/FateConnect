import { format, parseISO } from 'date-fns';

import type { LostItem } from '@app/services/lostAndFound/types';
import { Typography } from '@design-system';
import { CalendarTodayIcon, ImageIcon, LocationOnIcon } from '@design-system/icons';

import { LostItemTags } from './LostItemTags';
import * as C from './constants';
import * as S from './styles';

const DATE_FORMAT = 'dd/MM/yyyy';

type LostItemCardProps = Readonly<{ item: LostItem }>;

export function LostItemCard({ item }: LostItemCardProps) {
  return (
    <S.CardRoot component="article">
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

          <S.WideOnlyTags>
            <LostItemTags item={item} />
          </S.WideOnlyTags>
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
        </S.InfoRow>

        {item.descricao && (
          <S.Description>
            <Typography variant="subtitle" color="inherit">
              {item.descricao}
            </Typography>
          </S.Description>
        )}

        <S.CompactOnlyTags>
          <LostItemTags item={item} />
        </S.CompactOnlyTags>
      </S.CardBody>
    </S.CardRoot>
  );
}
