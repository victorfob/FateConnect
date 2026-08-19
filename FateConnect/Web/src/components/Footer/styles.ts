import { colorTokens, mobileMedia, spacing, spacingScale, styled } from '@design-system';

const { md } = spacingScale;

/**
 * Porte fiel do rodapé do produto: linha no desktop (contatos à esquerda,
 * assinatura à direita, divisor vertical entre eles) e coluna centralizada
 * abaixo de 768px. Paddings em `vw`, como no original.
 */
export const FooterRoot = styled('footer')({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  backgroundColor: colorTokens.primary,
  color: colorTokens.textOnAccent,
  padding: '3vw 7vw',
  gap: spacing(md),
  width: '100%',

  [mobileMedia]: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: '7vw',
  },
});

export const ContactsContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: spacing(md),
  width: '100%',

  [mobileMedia]: {
    alignItems: 'center',
  },
});

export const ContactItem = styled('div')({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing(spacingScale.xs),
});

/** Vertical no desktop, horizontal no mobile. */
export const FooterDivider = styled('div')({
  width: '1px',
  height: 'auto',
  backgroundColor: colorTokens.divider,

  [mobileMedia]: {
    width: '100%',
    height: '1px',
  },
});

export const CopyrightContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'flex-end',
  gap: spacing(md),
  width: '100%',

  [mobileMedia]: {
    alignItems: 'center',
  },
});
