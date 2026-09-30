import type { ReactNode } from 'react';

import * as S from './styles';

export type DialogMessageProps = Readonly<{ children: ReactNode }>;

export function DialogMessage({ children }: DialogMessageProps) {
  return <S.MessageText variant="subtitle">{children}</S.MessageText>;
}
