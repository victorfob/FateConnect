import type { ReactNode } from 'react';

import * as S from './styles';

export type ActionBarProps = Readonly<{ children: ReactNode }>;

export function ActionBar({ children }: ActionBarProps) {
  return <S.ActionBarRoot>{children}</S.ActionBarRoot>;
}
