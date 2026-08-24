import { LOST_ITEM_KIND_TONE } from '@app/pages/LostAndFound/helpers/lostItemKind';
import {
  lostItemStatusLabel,
  lostItemStatusTone,
} from '@app/pages/LostAndFound/helpers/lostItemStatus';
import type { LostItem } from '@app/services/lostAndFound/types';
import { StatusTag } from '@design-system';

import { OWN_ITEM_LABEL } from './constants';
import * as S from './styles';

type LostItemTagsProps = Readonly<{ item: LostItem }>;

export function LostItemTags({ item }: LostItemTagsProps) {
  return (
    <S.TagRow>
      {item.meuItem && <StatusTag tone="muted">{OWN_ITEM_LABEL}</StatusTag>}

      <StatusTag tone={LOST_ITEM_KIND_TONE}>{item.tipo}</StatusTag>

      <StatusTag tone={lostItemStatusTone(item.situacao)}>
        {lostItemStatusLabel(item.situacao)}
      </StatusTag>
    </S.TagRow>
  );
}
