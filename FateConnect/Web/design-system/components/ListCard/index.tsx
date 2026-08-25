import type { ReactNode } from 'react';

import { HiddenField } from '@ds-root/components/HiddenField';

import * as S from './styles';

export type ListCardProps = Readonly<{
  /** Marca o registro como de quem olha, com a faixa na borda esquerda. */
  own?: boolean;
  /** O que o leitor de tela ouve no lugar da faixa; a copy é de quem consome. */
  ownLabel?: string;
  /** Coluna à esquerda do corpo — a foto do registro ou o lugar dela. */
  media?: ReactNode;
  /** Conteúdo por composição: `ListCard.Header`, `ListCard.InfoRow`, `ListCard.Description`. */
  children: ReactNode;
}>;

/**
 * Cartão de um registro numa lista: papel, a coluna opcional de mídia e o corpo.
 * É o mesmo cromo para caronas e para achados e perdidos — quem precisa de um
 * monta os slots em vez de escrever outro.
 */
function ListCard({ own = false, ownLabel, media, children }: ListCardProps) {
  return (
    <S.CardRoot component="article" own={own}>
      {own && ownLabel && <HiddenField component="span">{ownLabel}</HiddenField>}

      {media}

      <S.CardBody>{children}</S.CardBody>
    </S.CardRoot>
  );
}

ListCard.Header = S.HeaderRow;
ListCard.Actions = S.HeaderActions;
ListCard.ActionButtons = S.ActionButtons;
ListCard.InfoRow = S.InfoRow;
ListCard.InfoItem = S.InfoItem;
ListCard.Description = S.Description;

export { ListCard };
