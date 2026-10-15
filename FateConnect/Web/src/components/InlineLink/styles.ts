import type { AnchorHTMLAttributes } from 'react';
import { PolymorphicBox, spacingScale, styled } from '@design-system';

const { none } = spacingScale;

export const InlineLinkRoot = styled(PolymorphicBox)<
  AnchorHTMLAttributes<HTMLAnchorElement> & { to?: string; type?: 'button' }
>(({ theme }) => ({
  display: 'inline',
  font: 'inherit',
  textDecoration: 'none',
  padding: theme.space(none),
  border: 'none',
  background: 'none',
  color: theme.palette.brandText,
  cursor: 'pointer',

  '&:hover': {
    textDecoration: 'underline',
    textDecorationColor: theme.palette.brandText,
  },
}));
