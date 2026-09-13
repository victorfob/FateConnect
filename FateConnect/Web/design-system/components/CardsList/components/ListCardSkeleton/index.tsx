import { ListCard } from '@ds-root/components/ListCard';

import * as S from './styles';

type ListCardSkeletonProps = Readonly<{ count: number }>;

export function ListCardSkeleton({ count }: ListCardSkeletonProps) {
  const ghostKeys = Array.from({ length: count }, (_, index) => index);

  return (
    <S.SkeletonList role="status" aria-busy>
      {ghostKeys.map((key) => (
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
