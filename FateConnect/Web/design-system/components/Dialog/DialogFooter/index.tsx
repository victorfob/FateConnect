import type { ReactNode } from 'react';

import * as S from './styles';

export type DialogFooterProps = Readonly<{ children: ReactNode }>;

export function DialogFooter({ children }: DialogFooterProps) {
  return <S.FooterRegion>{children}</S.FooterRegion>;
}
