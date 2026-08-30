import { ListCard } from '@ds-root/components/ListCard';

import { GHOST_CARD_KEYS } from './constants';
import * as S from './styles';

export function ListCardSkeleton() {
  return (
    <S.SkeletonList role="status" aria-busy>
      {GHOST_CARD_KEYS.map((key) => (
        <ListCard key={key}>
          <ListCard.Header>
            <S.GhostTitle />
          </ListCard.Header>

          <ListCard.InfoRow>
            <ListCard.InfoItem>
              <S.GhostInfo />
            </ListCard.InfoItem>

            <ListCard.InfoItem>
              <S.GhostInfo />
            </ListCard.InfoItem>
          </ListCard.InfoRow>

          <ListCard.Description>
            <S.GhostDescription />
          </ListCard.Description>
        </ListCard>
      ))}
    </S.SkeletonList>
  );
}
