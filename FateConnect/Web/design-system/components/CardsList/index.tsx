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

  // A paginação mora dentro da coluna, e não ao lado dela, porque o contêiner da
  // página separa os filhos com um vão próprio — de fora, o controle flutuaria
  // longe da lista a que pertence. Aqui quem dá o respiro é a margem do último
  // cartão, a mesma que separa um cartão do outro.
  return (
    <S.CardsColumn>
      {isEmpty && <Typography variant="subtitle">{emptyMessage}</Typography>}
      {!isEmpty && children}
      {pagination && <S.PaginationRow>{pagination}</S.PaginationRow>}
    </S.CardsColumn>
  );
}
