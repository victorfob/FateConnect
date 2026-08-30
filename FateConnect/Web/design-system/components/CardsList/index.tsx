import type { ReactNode } from 'react';

import { Typography } from '@ds-root/ui';

import { ListCardSkeleton } from './components/ListCardSkeleton';
import * as S from './styles';

export type CardsListProps = Readonly<{
  isLoading: boolean;
  isEmpty: boolean;
  emptyMessage: string;
  pagination?: ReactNode;
  children: ReactNode;
}>;

export function CardsList({
  isLoading,
  isEmpty,
  emptyMessage,
  pagination,
  children,
}: CardsListProps) {
  if (isLoading)
    return (
      <S.CardsColumn>
        <ListCardSkeleton />
      </S.CardsColumn>
    );

  return (
    <>
      <S.CardsColumn>
        {isEmpty && <Typography variant="subtitle">{emptyMessage}</Typography>}
        {!isEmpty && children}
      </S.CardsColumn>

      {pagination && <S.PaginationRow>{pagination}</S.PaginationRow>}
    </>
  );
}
