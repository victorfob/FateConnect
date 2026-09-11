import type { ReactNode } from 'react';

import * as S from './styles';

export type UnderlinedLinkProps = Readonly<{
  href: string;
  children: ReactNode;
  /** Fica dentro da área clicável, ao lado do texto, e fora do sublinhado. */
  icon?: ReactNode;
  /**
   * Substitui o texto visível para quem usa leitor de tela, então precisa dizer
   * a ação sem perder o valor que a linha mostra.
   */
  accessibleLabel?: string;
  opensInNewTab?: boolean;
}>;

const NEW_TAB_TARGET = '_blank';
const NEW_TAB_REL = 'noopener noreferrer';

function newTabAttributes(opensInNewTab: boolean | undefined) {
  if (!opensInNewTab) return {};

  return { target: NEW_TAB_TARGET, rel: NEW_TAB_REL };
}

export function UnderlinedLink({
  href,
  children,
  icon,
  accessibleLabel,
  opensInNewTab,
}: UnderlinedLinkProps) {
  return (
    <S.LinkRoot
      component="a"
      href={href}
      aria-label={accessibleLabel}
      {...newTabAttributes(opensInNewTab)}
    >
      {icon}
      <S.LinkText component="span">{children}</S.LinkText>
    </S.LinkRoot>
  );
}
