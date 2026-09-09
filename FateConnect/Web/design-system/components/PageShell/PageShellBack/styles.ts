import Typography from '@mui/material/Typography';

import { PolymorphicStack } from '@ds-root/polymorphic';
import { styled } from '@ds-root/styled';
import { radiusScale, shadowTokens, spacingScale } from '@ds-root/tokens';

const { xs, md } = spacingScale;

/** 10px na vertical — sem token equivalente entre 8px e 12px. */
const VERTICAL_PADDING_PX = 10;

export const BackAction = styled(PolymorphicStack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.space(xs),
  padding: theme.space(VERTICAL_PADDING_PX, md),
  borderRadius: theme.radius(radiusScale.component),
  overflow: 'hidden',
  textDecoration: 'none',
  color: theme.palette.chrome.contrastText,
  background: theme.palette.chrome.main,
  boxShadow: shadowTokens.component,
}));

/**
 * No estreito a ação fica só com o ícone: o nome dela passa a vir do `aria-label`,
 * como no botão de ícone do design system. Sem isso o rótulo consome a linha do
 * cabeçalho, o título quebra e não sobra vão entre a ação e o que vem antes dela.
 */
export const BackLabel = styled(Typography)(({ theme }) => ({
  [theme.breakpoints.down('md')]: { display: 'none' },
}));
