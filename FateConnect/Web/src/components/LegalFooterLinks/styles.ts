import type { AnchorHTMLAttributes } from 'react';
import { PolymorphicBox, spacingScale, Stack, styled } from '@design-system';

const { none, xs, md } = spacingScale;

const UNDERLINE_THICKNESS_PX = '1px';
const UNDERLINE_WIDTH = '60%';
const UNDERLINE_WIDTH_HOVER = '100%';
const UNDERLINE_REST_OPACITY = 0.6;

export const LinksRow = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  gap: theme.space(md),

  [theme.breakpoints.down('md')]: { flexDirection: 'column', gap: theme.space(xs) },
}));

export const DocumentLink = styled(PolymorphicBox)<AnchorHTMLAttributes<HTMLAnchorElement>>(
  ({ theme }) => ({
    position: 'relative',
    color: 'inherit',
    textDecoration: 'none',
    cursor: 'pointer',

    '&::after': {
      content: '""',
      position: 'absolute',
      left: '50%',
      transform: 'translateX(-50%)',
      bottom: theme.space(none),
      width: UNDERLINE_WIDTH,
      height: UNDERLINE_THICKNESS_PX,
      backgroundColor: 'currentColor',
      opacity: UNDERLINE_REST_OPACITY,
      transition: theme.transitions.create(['width', 'opacity']),
    },

    // Sem a guarda, o sublinhado fica preenchido depois do toque e não volta.
    '@media (hover: hover)': {
      '&:hover::after': { width: UNDERLINE_WIDTH_HOVER, opacity: 1 },
    },
  }),
);
