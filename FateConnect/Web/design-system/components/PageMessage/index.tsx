import type { ReactNode } from 'react';
import Typography from '@mui/material/Typography';

import { FeedbackIcon } from '@ds-root/components/FeedbackIcon';
import type { FeedbackTone } from '@ds-root/theme/types';

import * as S from './styles';

export type PageMessageProps = Readonly<{
  title: string;
  description?: string;
  /** Sem tom, o recado não leva ícone: é o caso de quem ainda está carregando. */
  tone?: FeedbackTone;
  /** Ação de saída — normalmente um botão de volta. */
  children?: ReactNode;
}>;

/**
 * Recado num cartão no meio da área de conteúdo: o ícone do tom, título, texto e
 * uma ação opcional. Serve de área ainda não disponível a erro não capturado.
 */
export function PageMessage({ title, description, tone, children }: PageMessageProps) {
  return (
    <S.PageMessageRoot>
      <S.MessageCard>
        {tone && <FeedbackIcon tone={tone} />}
        <Typography variant="h1">{title}</Typography>
        {description && <Typography variant="body">{description}</Typography>}

        {children}
      </S.MessageCard>
    </S.PageMessageRoot>
  );
}
