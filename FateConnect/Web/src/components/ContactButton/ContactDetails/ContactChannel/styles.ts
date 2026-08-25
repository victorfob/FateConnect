import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';
import {
  iconSizeTokens,
  PolymorphicStack,
  spacing,
  spacingScale,
  styled,
  Typography,
} from '@design-system';

const { none, xs } = spacingScale;

/**
 * A mesma linha serve de âncora e de botão, então a tipagem carrega as props dos
 * dois — é o que permite `component="a"` com `href` e `component="button"` com
 * `type` e `onClick` sem cast no ponto de uso.
 */
type ChannelRowProps = Pick<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'target' | 'rel'> &
  Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'onClick'>;

export const ChannelRow = styled(PolymorphicStack)<ChannelRowProps>(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing(xs),
  color: theme.palette.text.primary,
  textDecoration: 'none',

  // Como botão, o elemento vem com cromo de formulário: sem isto a linha ganha
  // borda, fundo e a fonte do sistema, e deixa de parecer com a linha do link.
  padding: spacing(none),
  border: 'none',
  background: 'none',
  font: 'inherit',
  textAlign: 'left',
  cursor: 'pointer',

  '& svg': {
    color: theme.palette.secondary.main,
    fontSize: `${iconSizeTokens.sm}px`,
    // O ícone é a bandeira do canal, não parte do texto: sem isso ele encolhe
    // junto com a quebra de um e-mail longo.
    flexShrink: 0,
  },

  '&:hover': { textDecoration: 'underline' },
}));

/** E-mail longo quebra em vez de esticar o diálogo além da tela. */
export const ChannelText = styled(Typography)({
  wordBreak: 'break-word',
});
