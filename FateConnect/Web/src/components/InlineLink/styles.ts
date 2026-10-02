import type { AnchorHTMLAttributes } from 'react';
import { PolymorphicBox, spacingScale, styled } from '@design-system';

const { none } = spacingScale;

export const InlineLinkRoot = styled(PolymorphicBox)<
  AnchorHTMLAttributes<HTMLAnchorElement> & { to?: string }
>(({ theme }) => ({
  display: 'inline',
  font: 'inherit',
  textDecoration: 'none',
  padding: theme.space(none),
  color: theme.palette.brandText,
  cursor: 'pointer',

  '&:hover': {
    textDecoration: 'underline',
    textDecorationColor: theme.palette.brandText,
  },
}));
