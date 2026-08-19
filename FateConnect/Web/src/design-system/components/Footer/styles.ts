import { styled } from '../../styled';
import { chromeDivider, chromeSurface, onChromeSurface } from '../../theme/chromeSurface';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { PolymorphicProps } from '../../styled';
import { mobileMedia, spacingScale } from '../../tokens';
import { spacing } from '../../theme/helpers/spacing';

const { md, xs } = spacingScale;

/**
 * Porte fiel do rodapé do produto: linha no desktop (contatos à esquerda,
 * assinatura à direita, divisor vertical entre eles) e coluna centralizada
 * abaixo do breakpoint mobile. Paddings em `vw`, como no original.
 */
export const FooterRoot = styled(Stack)<PolymorphicProps>(({ theme }) => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  backgroundColor: chromeSurface(theme),
  color: onChromeSurface(theme),
  padding: '3vw 7vw',
  gap: spacing(md),
  width: '100%',

  [mobileMedia]: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: '7vw',
  },
}));

export const ContactsContainer = styled(Stack)<PolymorphicProps>({
  flexDirection: 'column',
  justifyContent: 'center',
  gap: spacing(md),
  width: '100%',

  [mobileMedia]: { alignItems: 'center' },
});

export const ContactItem = styled(Stack)<PolymorphicProps>({
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing(xs),
});

/** Vertical no desktop, horizontal no mobile. */
export const FooterDivider = styled(Box)<PolymorphicProps>(({ theme }) => ({
  width: '1px',
  height: 'auto',
  backgroundColor: chromeDivider(theme),

  [mobileMedia]: { width: '100%', height: '1px' },
}));

export const CopyrightContainer = styled(Stack)<PolymorphicProps>({
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'flex-end',
  gap: spacing(md),
  width: '100%',

  [mobileMedia]: { alignItems: 'center' },
});
