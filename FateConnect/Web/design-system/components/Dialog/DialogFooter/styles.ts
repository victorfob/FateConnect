import Stack from '@mui/material/Stack';

import { styled } from '@ds-root/styled';
import { radiusScale, spacingScale } from '@ds-root/tokens';

const { xs } = spacingScale;

const ACTION_MIN_WIDTH_PX = 120;
const ACTION_MIN_WIDTH_MOBILE_PX = 100;
const ACTION_LETTER_SPACING = '0.4px';

/** As ações acompanham o título, que é centralizado em qualquer largura. */
export const FooterRegion = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.space(xs),
  flexWrap: 'wrap',

  // Largura mínima igual para as ações não ficarem de tamanhos diferentes por
  // causa do rótulo — "Excluir" ao lado de "Cancelar" não deve encolher.
  '& .MuiButton-root': {
    minWidth: `${ACTION_MIN_WIDTH_PX}px`,
    borderRadius: theme.radius(radiusScale.component),
    letterSpacing: ACTION_LETTER_SPACING,
  },

  [theme.breakpoints.down('md')]: {
    '& .MuiButton-root': { minWidth: `${ACTION_MIN_WIDTH_MOBILE_PX}px` },
  },
}));
