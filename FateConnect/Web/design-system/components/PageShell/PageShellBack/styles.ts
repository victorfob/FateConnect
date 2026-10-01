import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { styled } from '@ds-root/styled';
import { spacingScale } from '@ds-root/tokens';

const { xs } = spacingScale;

export const BackAction = styled(Button)<{ to?: string }>(({ theme }) => ({
  gap: theme.space(xs),
  // Só com o ícone, no estreito, a largura mínima do botão o deixaria retangular.
  minWidth: 0,
}));

/**
 * No estreito a ação fica só com o ícone: o nome dela passa a vir do `aria-label`,
 * como no botão de ícone do design system. Sem isso o rótulo consome a linha do
 * cabeçalho, o título quebra e não sobra vão entre a ação e o que vem antes dela.
 */
export const BackLabel = styled(Typography)<{ component?: 'span' }>(({ theme }) => ({
  [theme.breakpoints.down('md')]: { display: 'none' },
}));
