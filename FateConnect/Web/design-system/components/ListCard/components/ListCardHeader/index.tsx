import type { ReactNode } from 'react';

import { HEADER_ATTRIBUTE } from '@ds-root/components/ListCard/constants';

import * as S from './styles';

export type ListCardHeaderProps = Readonly<{ children: ReactNode }>;

/** Título à esquerda, etiqueta e ações à direita. */
export function ListCardHeader({ children }: ListCardHeaderProps) {
  return <S.HeaderRow {...{ [HEADER_ATTRIBUTE]: '' }}>{children}</S.HeaderRow>;
}
