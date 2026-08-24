import type { ReactNode } from 'react';

import * as S from './styles';

export type FilterPanelFieldProps = Readonly<{ children: ReactNode }>;

export function FilterPanelField({ children }: FilterPanelFieldProps) {
  return <S.FieldCell>{children}</S.FieldCell>;
}
