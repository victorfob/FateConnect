import type { LinkProps } from 'react-router';
import { PolymorphicBox, PolymorphicStack, spacingScale, styled } from '@design-system';

const { xs } = spacingScale;

export const LogoLink = styled(PolymorphicStack)<Pick<LinkProps, 'to'>>(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.space(xs),
}));

/** A inicial de `Connect`, no mesmo vermelho do capelo do símbolo ao lado. */
export const AccentInitial = styled(PolymorphicBox)(({ theme }) => ({
  color: theme.palette.chrome.accent,
}));
