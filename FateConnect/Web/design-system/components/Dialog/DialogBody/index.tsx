import type { ReactNode } from 'react';

import * as S from './styles';

export type DialogBodyProps = Readonly<{ children: ReactNode }>;

/**
 * Miolo do diálogo: fica com o espaço que sobra depois do título e do rodapé, e
 * é ele que rola quando o conteúdo passa da altura da tela.
 */
export function DialogBody({ children }: DialogBodyProps) {
  return <S.BodyRegion>{children}</S.BodyRegion>;
}
