import type { ReactNode } from 'react';
import Typography from '@mui/material/Typography';

import type { StatusTagTone } from '@ds-root/theme/statusTagSurface';

import * as S from './styles';

export type StatusTagProps = Readonly<{ tone?: StatusTagTone; children: ReactNode }>;

export function StatusTag({ tone = 'neutral', children }: StatusTagProps) {
  return (
    <S.TagRoot component="span" tone={tone}>
      <Typography variant="caption" color="inherit">
        {children}
      </Typography>
    </S.TagRoot>
  );
}
