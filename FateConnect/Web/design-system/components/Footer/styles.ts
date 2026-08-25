import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { PolymorphicStack } from '@ds-root/polymorphic';
import { styled } from '@ds-root/styled';
import { chromeDivider, chromeSurface, onChromeSurface } from '@ds-root/theme/chromeSurface';
import { spacingScale } from '@ds-root/tokens';

const { md, xs } = spacingScale;

/**
 * Porte fiel do rodapé do produto: linha no desktop (contatos à esquerda,
 * assinatura à direita, divisor vertical entre eles) e coluna centralizada
 * abaixo do breakpoint mobile. Paddings em `vw`, como no original.
 */
export const FooterRoot = styled(PolymorphicStack)(({ theme }) => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  backgroundColor: chromeSurface(theme),
  color: onChromeSurface(theme),
  padding: '3vw 7vw',
  gap: theme.space(md),
  width: '100%',

  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: '7vw',
  },
}));

/**
 * No mobile o produto centraliza também as linhas de texto, não só as caixas:
 * o alinhamento fica no contêiner e é herdado, no lugar do `:host-context` que
 * a tipografia usava para alcançar o pai.
 */
export const ContactsContainer = styled(Stack)(({ theme }) => ({
  flexDirection: 'column',
  justifyContent: 'center',
  gap: theme.space(md),
  width: '100%',

  [theme.breakpoints.down('md')]: { alignItems: 'center', textAlign: 'center' },
}));

export const ContactItem = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.space(xs),
}));

/** Vertical no desktop, horizontal no mobile. */
export const FooterDivider = styled(Box)(({ theme }) => ({
  width: '1px',
  height: 'auto',
  backgroundColor: chromeDivider(theme),

  [theme.breakpoints.down('md')]: { width: '100%', height: '1px' },
}));

export const CopyrightContainer = styled(Stack)(({ theme }) => ({
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'flex-end',
  gap: theme.space(md),
  width: '100%',

  [theme.breakpoints.down('md')]: { alignItems: 'center', textAlign: 'center' },
}));
