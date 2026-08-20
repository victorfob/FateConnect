import Avatar from '@mui/material/Avatar';

import { styled } from '../../styled';
import { spacingScale } from '../../tokens';

/**
 * Diâmetro do círculo. O desenho da tarefa põe o círculo em 42% da altura do
 * topo, e a escala do projeto não tem 28: com 24 as duas letras encostam na
 * borda no corpo de 0.875rem, então este é o token que respeita a proporção.
 */
const CIRCLE_SIZE_PX = spacingScale.xl;

export const InitialsCircle = styled(Avatar)(({ theme }) => ({
  width: `${CIRCLE_SIZE_PX}px`,
  height: `${CIRCLE_SIZE_PX}px`,
  backgroundColor: theme.palette.secondary.main,
  color: theme.palette.secondary.contrastText,
  ...theme.typography.captionBold,
}));
