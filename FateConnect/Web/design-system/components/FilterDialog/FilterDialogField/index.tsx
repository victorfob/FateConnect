import type { ReactNode } from 'react';

import * as S from './styles';

export type FilterDialogFieldProps = Readonly<{ children: ReactNode }>;

export function FilterDialogField({ children }: FilterDialogFieldProps) {
  return <S.FieldCell>{children}</S.FieldCell>;
}
