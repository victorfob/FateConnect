import type { ElementType } from 'react';
import type { LinkProps } from 'react-router';
import { Button, spacingScale, Stack, styled, Typography } from '@design-system';

const { none, xxs, sm, md, lg } = spacingScale;

const PANEL_WIDTH_PX = 320;

/**
 * No celular a largura do protótipo ocupa quase a tela toda, e o painel deixa de
 * parecer painel. O piso é o que mantém o rodapé numa linha só.
 */
const NARROW_PANEL_WIDTH_PX = 240;

type LinkedButtonProps = { component?: ElementType; to: LinkProps['to'] };

export const PanelColumn = styled(Stack)(({ theme }) => ({
  flexDirection: 'column',
  width: `${PANEL_WIDTH_PX}px`,

  [theme.breakpoints.down('md')]: { width: `${NARROW_PANEL_WIDTH_PX}px` },
}));

export const PanelTitle = styled(Typography)(({ theme }) => ({
  padding: theme.space(sm, md),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

export const EmptyState = styled(Stack)(({ theme }) => ({
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.space(xxs),
  padding: theme.space(lg, md),
  textAlign: 'center',
}));

export const EmptyDescription = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

export const PanelFooter = styled(Stack)(({ theme }) => ({
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.space(xxs, none),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

/** O vermelho da marca como texto — `color="secondary"` reprova no escuro. */
export const AllNotificationsLink = styled(Button)<LinkedButtonProps>(({ theme }) => ({
  color: theme.palette.brandText,
}));
