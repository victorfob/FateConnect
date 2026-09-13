import type { ReactNode } from 'react';

import { Typography } from '@ds-root/ui';

import { ListCardSkeleton } from './components/ListCardSkeleton';
import * as S from './styles';

export type CardsListProps = Readonly<{
  isLoading: boolean;
  /**
   * ⛔ Quantos cartões o esqueleto desenha. Reservando menos do que a página
   * traz, o conteúdo cresce depois da primeira pintura e empurra o rodapé —
   * deslocamento de layout. Quem sabe o tamanho da página é quem consulta.
   */
  skeletonCount: number;
  isEmpty: boolean;
  emptyMessage: string;
  pagination?: ReactNode;
  children: ReactNode;
}>;

export function CardsList({
  isLoading,
  skeletonCount,
  isEmpty,
  emptyMessage,
  pagination,
  children,
}: CardsListProps) {
  if (isLoading)
    return (
      <S.CardsColumn>
        <ListCardSkeleton count={skeletonCount} />
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
