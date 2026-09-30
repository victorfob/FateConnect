import type { ReactNode } from 'react';

import * as S from './styles';

export type FormGridProps = Readonly<{ children: ReactNode }>;

/** Dois campos por linha no desktop e um no estreito; `FormGrid.Wide` ocupa a linha inteira. */
export function FormGrid({ children }: FormGridProps) {
  return <S.GridRoot>{children}</S.GridRoot>;
}

FormGrid.Wide = S.WideCell;
