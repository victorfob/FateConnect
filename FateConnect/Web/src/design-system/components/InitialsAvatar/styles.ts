import Avatar from '@mui/material/Avatar';

import { styled } from '@src-ds/styled';
import { spacingScale } from '@src-ds/tokens';
import type { InitialsAvatarSize } from './types';

/**
 * Diâmetro do círculo. No cromo, o desenho da tarefa põe o círculo em 42% da
 * altura do topo, e a escala do projeto não tem 28: com 24 as duas letras
 * encostam na borda no corpo de 0.875rem, então `xl` é o token que respeita a
 * proporção. Dentro do diálogo o retrato é o assunto e sobe um degrau da escala
 * — o corpo do texto acompanha, mantendo a mesma folga até a borda.
 */
const DIAMETER_PX: Record<InitialsAvatarSize, number> = {
  small: spacingScale.xl,
  large: spacingScale.xxl,
};

export const InitialsCircle = styled(Avatar)<{ size: InitialsAvatarSize }>(({ theme, size }) => {
  const bodyBySize = {
    small: theme.typography.captionBold,
    large: theme.typography.subtitleBold,
  };

  return {
    width: `${DIAMETER_PX[size]}px`,
    height: `${DIAMETER_PX[size]}px`,
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    ...bodyBySize[size],
  };
});
