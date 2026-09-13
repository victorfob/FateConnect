import type { AnchorHTMLAttributes } from 'react';

import { PolymorphicBox } from '@ds-root/polymorphic';
import { styled } from '@ds-root/styled';
import { spacingScale } from '@ds-root/tokens';

const { none, xs } = spacingScale;

const UNDERLINE_THICKNESS_PX = '1px';
const UNDERLINE_WIDTH = '60%';
const UNDERLINE_WIDTH_HOVER = '100%';
const UNDERLINE_REST_OPACITY = 0.6;

export const LinkRoot = styled(PolymorphicBox)<AnchorHTMLAttributes<HTMLAnchorElement>>(
  ({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.space(xs),
    // Como item de um contêiner flex, o `stretch` esticaria a âncora pela coluna
    // inteira e o alvo passaria a valer muito além do texto.
    width: 'fit-content',
    color: 'inherit',
    textDecoration: 'none',
    cursor: 'pointer',

    // Sem a guarda, o sublinhado fica preenchido depois do toque e não volta.
    '@media (hover: hover)': {
      '&:hover > span::after': { width: UNDERLINE_WIDTH_HOVER, opacity: 1 },
    },
  }),
);

/**
 * O sublinhado mora aqui, e não na âncora, porque o ícone fica dentro da área
 * clicável: nascendo na âncora, o traço correria por baixo dele também.
 */
export const LinkText = styled(PolymorphicBox)(({ theme }) => ({
  position: 'relative',
  display: 'inline-block',

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
}));
