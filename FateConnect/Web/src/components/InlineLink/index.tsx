import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router';

import * as S from './styles';

export type InlineLinkProps = Readonly<{
  children: ReactNode;
  /** Documento fora do app, aberto em outra aba. */
  href?: string;
  /** Tela do próprio app. */
  to?: string;
}>;

export function InlineLink({ children, href, to }: InlineLinkProps) {
  if (to)
    return (
      <S.InlineLinkRoot component={RouterLink} to={to}>
        {children}
      </S.InlineLinkRoot>
    );

  return (
    <S.InlineLinkRoot component="a" href={href} target="_blank" rel="noreferrer">
      {children}
    </S.InlineLinkRoot>
  );
}
