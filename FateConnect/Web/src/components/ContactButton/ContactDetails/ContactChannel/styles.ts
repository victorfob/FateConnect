import type { AnchorHTMLAttributes } from 'react';
import { iconSizeTokens, PolymorphicStack, spacingScale, styled, Typography } from '@design-system';

const { xs } = spacingScale;

type ChannelRowProps = Pick<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'target' | 'rel'>;

export const ChannelRow = styled(PolymorphicStack)<ChannelRowProps>(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.space(xs),
  color: theme.palette.text.primary,
  textDecoration: 'none',

  '& svg': {
    color: theme.palette.brandText,
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
