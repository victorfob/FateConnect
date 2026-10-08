import type { ReactNode } from 'react';

import * as S from './styles';

export type ContactChannelProps = Readonly<{
  href: string;
  /** O próprio dado de contato — é ele que aparece em tela. */
  children: string;
  icon: ReactNode;
  /** Nome para o leitor de tela; precisa conter o texto visível. */
  accessibleLabel?: string;
  opensInNewTab?: boolean;
}>;

const NEW_TAB_ATTRIBUTES = { target: '_blank', rel: 'noopener noreferrer' };

/**
 * Uma via de contato: ícone na cor de destaque e o dado, como link para o
 * aplicativo que atende o canal — conversa, discador, cliente de e-mail.
 */
export function ContactChannel({
  href,
  children,
  icon,
  accessibleLabel,
  opensInNewTab,
}: ContactChannelProps) {
  return (
    <S.ChannelRow
      component="a"
      href={href}
      aria-label={accessibleLabel}
      {...(opensInNewTab ? NEW_TAB_ATTRIBUTES : {})}
    >
      {icon}
      <S.ChannelText variant="body" color="inherit">
        {children}
      </S.ChannelText>
    </S.ChannelRow>
  );
}
