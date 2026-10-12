import type { ReactNode } from 'react';
import type SvgIcon from '@mui/material/SvgIcon';

import { FeedbackIcon } from '@ds-root/components/FeedbackIcon';
import type { FeedbackTone } from '@ds-root/theme/types';

import * as S from './styles';

export type DialogMessageProps = Readonly<{
  children: ReactNode;
  /** Com tom, o ícone vem acima da frase, e os dois ficam no centro também no celular. */
  tone?: FeedbackTone;
  icon?: typeof SvgIcon;
}>;

export function DialogMessage({ children, tone, icon }: DialogMessageProps) {
  if (!tone) return <S.MessageText variant="body">{children}</S.MessageText>;

  return (
    <S.FeedbackMessage>
      <FeedbackIcon tone={tone} icon={icon} />
      <S.FeedbackText variant="body">{children}</S.FeedbackText>
    </S.FeedbackMessage>
  );
}
