import type { ReactNode } from 'react';

import { ACTIONS_ATTRIBUTE } from '../constants';
import * as S from './styles';

export type ListCardActionsProps = Readonly<{ children: ReactNode }>;

/**
 * Etiqueta e ações do cabeçalho do cartão. O atributo é como o cartão as
 * alcança para prendê-las ao canto quando a mídia empurra o cabeçalho para
 * baixo.
 */
export function ListCardActions({ children }: ListCardActionsProps) {
  return <S.ActionsRow {...{ [ACTIONS_ATTRIBUTE]: '' }}>{children}</S.ActionsRow>;
}
