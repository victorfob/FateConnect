import type { ReactNode } from 'react';

import { ACTIONS_ATTRIBUTE } from '@ds-root/components/ListCard/constants';

import * as S from './styles';

export type ListCardActionsProps = Readonly<{ children: ReactNode }>;

/**
 * Etiqueta e ações do cabeçalho do cartão. O atributo é como o cartão as
 * alcança para levá-las ao topo quando há mídia no estreito.
 */
export function ListCardActions({ children }: ListCardActionsProps) {
  return <S.ActionsRow {...{ [ACTIONS_ATTRIBUTE]: '' }}>{children}</S.ActionsRow>;
}
