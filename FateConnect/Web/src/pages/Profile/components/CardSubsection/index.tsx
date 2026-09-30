import type { ReactNode } from 'react';
import { Typography } from '@design-system';

import * as S from './styles';

export type CardSubsectionProps = Readonly<{ title: string; children: ReactNode }>;

export function CardSubsection({ title, children }: CardSubsectionProps) {
  return (
    <S.SubsectionRoot>
      <Typography variant="subtitleBold" component="h3">
        {title}
      </Typography>
      {children}
    </S.SubsectionRoot>
  );
}
