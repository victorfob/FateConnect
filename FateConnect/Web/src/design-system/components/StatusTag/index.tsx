import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import type { StatusTagTone } from '@src-ds/theme/statusTagSurface';

import * as S from './styles';

export type StatusTagProps = Readonly<{ tone?: StatusTagTone; children: ReactNode }>;

/** Etiqueta de estado — fundo suave com o texto na cor correspondente. */
export function StatusTag({ tone = 'neutral', children }: StatusTagProps) {
  return (
    <S.TagRoot component="span" tone={tone}>
      <Typography variant="caption" color="inherit">
        {children}
      </Typography>
    </S.TagRoot>
  );
}
