import type { ReactNode } from 'react';

import * as S from './styles';

export type DialogFooterProps = Readonly<{ children: ReactNode }>;

/** Rodapé do diálogo: o complemento do conteúdo, normalmente os botões de ação. */
export function DialogFooter({ children }: DialogFooterProps) {
  return <S.FooterRegion>{children}</S.FooterRegion>;
}
