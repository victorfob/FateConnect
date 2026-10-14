import type { ReactNode } from 'react';

import { BOTTOM_ACTION_ATTRIBUTE } from '@ds-root/components/ListCard/constants';

import * as S from './styles';

export type ListCardBottomActionProps = Readonly<{ children: ReactNode }>;

/** À direita da última linha do conteúdo no desktop; no estreito, numa linha só dele. */
export function ListCardBottomAction({ children }: ListCardBottomActionProps) {
  return <S.BottomActionSlot {...{ [BOTTOM_ACTION_ATTRIBUTE]: '' }}>{children}</S.BottomActionSlot>;
}
