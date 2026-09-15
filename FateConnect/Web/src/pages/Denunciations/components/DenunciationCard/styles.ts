import { spacingScale, Stack, styled, Typography } from '@design-system';

const { xxs } = spacingScale;

const COLLAPSED_LINES = 2;

/**
 * A entrelinha da variante `subtitle`. Em `em`, o recorte acompanha a fonte do
 * próprio texto em vez de depender de um pixel medido uma vez.
 */
const LINE_HEIGHT_EM = 1.5;

/** Teto da transição: `max-height` precisa de destino, e `auto` não se anima. */
const EXPANDED_LINES = 40;

function visibleLines(isCollapsed: boolean): number {
  if (isCollapsed) return COLLAPSED_LINES;

  return EXPANDED_LINES;
}

export const Description = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'isCollapsed',
})<{ isCollapsed: boolean }>(({ theme, isCollapsed }) => ({
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: visibleLines(isCollapsed),
  overflow: 'hidden',
  maxHeight: `${visibleLines(isCollapsed) * LINE_HEIGHT_EM}em`,
  transition: theme.transitions.create('max-height', {
    duration: theme.transitions.duration.shortest,
    easing: theme.transitions.easing.easeOut,
  }),
  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
}));

export const DescriptionToggle = styled(Stack)(({ theme }) => ({
  alignItems: 'flex-end',
  marginTop: theme.space(xxs),
}));
