import type { ReactNode } from 'react';

import * as S from './styles';

type ChannelContent = Readonly<{
  /** O próprio dado de contato — é ele que aparece em tela. */
  children: string;
  icon: ReactNode;
}>;

/**
 * Canal que entrega o contato a outro aplicativo — conversa, discador, cliente
 * de e-mail. Sempre sai da aplicação, então abre em outra aba e sem dar acesso
 * à janela de origem.
 */
type LinkChannelProps = ChannelContent & Readonly<{ href: string }>;

/** Canal que age na própria tela: o dado vira botão. */
type ActionChannelProps = ChannelContent &
  Readonly<{
    onClick: VoidFunction;
    /**
     * Nome acessível do botão: o dado sozinho não diz o que o clique faz. Precisa
     * conter o texto visível, que é o que a diretriz de rótulo no nome exige.
     */
    label: string;
  }>;

export type ContactChannelProps = LinkChannelProps | ActionChannelProps;

/**
 * Uma via de contato: ícone na cor de destaque e o dado, clicável. Link quando
 * leva para fora, botão quando a ação acontece aqui — são elementos diferentes
 * porque significam coisas diferentes para quem navega por teclado e por leitor.
 */
export function ContactChannel(props: ContactChannelProps) {
  if ('href' in props) {
    return (
      <S.ChannelRow component="a" href={props.href} target="_blank" rel="noopener noreferrer">
        {props.icon}
        <S.ChannelText variant="subtitle" color="inherit">
          {props.children}
        </S.ChannelText>
      </S.ChannelRow>
    );
  }

  return (
    <S.ChannelRow component="button" type="button" onClick={props.onClick} aria-label={props.label}>
      {props.icon}
      <S.ChannelText variant="subtitle" color="inherit">
        {props.children}
      </S.ChannelText>
    </S.ChannelRow>
  );
}
