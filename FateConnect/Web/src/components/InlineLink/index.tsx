import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router';

import * as S from './styles';

export type InlineLinkProps = Readonly<{
  children: ReactNode;
  /** Documento fora do app, aberto em outra aba. */
  href?: string;
  /** Tela do próprio app. */
  to?: string;
  /** Ação na própria tela, com cara de link no meio do texto. */
  onClick?: VoidFunction;
}>;

export function InlineLink({ children, href, to, onClick }: InlineLinkProps) {
  if (to)
    return (
      <S.InlineLinkRoot component={RouterLink} to={to}>
        {children}
      </S.InlineLinkRoot>
    );

  if (onClick)
    return (
      <S.InlineLinkRoot component="button" type="button" onClick={onClick}>
        {children}
      </S.InlineLinkRoot>
    );

  return (
    <S.InlineLinkRoot component="a" href={href} target="_blank" rel="noreferrer">
      {children}
    </S.InlineLinkRoot>
  );
}
