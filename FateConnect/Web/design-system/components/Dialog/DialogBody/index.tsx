import type { ReactNode } from 'react';

import * as S from './styles';

export type DialogBodyProps = Readonly<{ children: ReactNode }>;

/** É ele que rola quando o conteúdo passa da altura da tela, não o diálogo. */
export function DialogBody({ children }: DialogBodyProps) {
  return <S.BodyRegion>{children}</S.BodyRegion>;
}
