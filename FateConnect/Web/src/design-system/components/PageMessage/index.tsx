import type { ReactNode } from 'react';
import Typography from '@mui/material/Typography';

import * as S from './styles';

export type PageMessageProps = Readonly<{
  title: string;
  description: string;
  /** Ação de saída — normalmente um botão de volta. */
  children?: ReactNode;
}>;

/**
 * Recado que ocupa a área de conteúdo: título, texto e uma ação opcional.
 * Serve tanto para área ainda não disponível quanto para erro não capturado.
 */
export function PageMessage({ title, description, children }: PageMessageProps) {
  return (
    <S.PageMessageRoot>
      <S.MessageContent>
        <Typography variant="h1">{title}</Typography>
        <Typography variant="subtitle">{description}</Typography>

        {children}
      </S.MessageContent>
    </S.PageMessageRoot>
  );
}
