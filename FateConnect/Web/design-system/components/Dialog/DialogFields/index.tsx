import type { ReactNode } from 'react';

import { FormGrid } from '@ds-root/components/FormGrid';

import type { DialogFieldsLayout } from './types';
import * as S from './styles';

export type DialogFieldsProps = Readonly<{
  /** `grid` é o `FormGrid`; `column` põe um campo por linha em qualquer largura. */
  layout?: DialogFieldsLayout;
  children: ReactNode;
}>;

export function DialogFields({ layout = 'grid', children }: DialogFieldsProps) {
  if (layout === 'column') return <S.ColumnRegion>{children}</S.ColumnRegion>;

  return (
    <S.GridRegion>
      <FormGrid>{children}</FormGrid>
    </S.GridRegion>
  );
}

DialogFields.Wide = FormGrid.Wide;
