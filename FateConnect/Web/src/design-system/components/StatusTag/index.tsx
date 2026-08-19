import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

import * as S from './styles';
import type { StatusTagTone } from './types';

export type StatusTagProps = { tone?: StatusTagTone; children: ReactNode };

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
