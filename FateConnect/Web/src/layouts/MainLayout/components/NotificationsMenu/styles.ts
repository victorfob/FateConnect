import type { ElementType } from 'react';
import type { LinkProps } from 'react-router';
import { Button, spacingScale, Stack, styled, Typography } from '@design-system';

const { none, xxs, xs, sm, md } = spacingScale;

const PANEL_WIDTH_PX = 320;

/**
 * No celular a largura do protótipo ocupa quase a tela toda, e o painel deixa de
 * parecer painel; mais estreito, cada aviso vira uma coluna de palavras.
 */
const NARROW_PANEL_WIDTH_PX = 280;

type LinkedButtonProps = { component?: ElementType; to: LinkProps['to'] };

/** Encolhe até a altura do papel, para a lista rolar entre o topo e o link. */
export const PanelColumn = styled(Stack)(({ theme }) => ({
  flexDirection: 'column',
  minHeight: 0,
  width: `${PANEL_WIDTH_PX}px`,

  [theme.breakpoints.down('md')]: { width: `${NARROW_PANEL_WIDTH_PX}px` },
}));

export const PanelHeader = styled(Stack)(({ theme }) => ({
  flexShrink: 0,
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  columnGap: theme.space(xs),
  padding: theme.space(sm, md),
  borderBottom: `1px solid ${theme.palette.divider}`,

  // No estreito o botão desce para baixo do título, e o texto dele começa na
  // mesma linha do título: o respiro lateral do botão o empurraria para dentro.
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',

    '& .MuiButton-root': { paddingLeft: theme.space(none), paddingRight: theme.space(none) },
  },
}));

export const PanelTitle = styled(Typography)({ flexShrink: 0 });

export const PanelFooter = styled(Stack)(({ theme }) => ({
  flexShrink: 0,
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.space(xxs, none),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

/** O vermelho da marca como texto — `color="secondary"` reprova no escuro. */
export const BrandTextButton = styled(Button)<Partial<LinkedButtonProps>>(({ theme }) => ({
  color: theme.palette.brandText,
}));
