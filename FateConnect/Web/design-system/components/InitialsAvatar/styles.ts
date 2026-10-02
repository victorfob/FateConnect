import Avatar from '@mui/material/Avatar';
import Skeleton from '@mui/material/Skeleton';

import { styled } from '@ds-root/styled';
import { spacingScale } from '@ds-root/tokens';

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
  portrait: 96,
};

/**
 * `size` é só para o estilo. Hoje ele não aparece no DOM por acidente: o React
 * descarta o atributo `size` quando o valor não é numérico, e a escala usa
 * palavras. Trocar `small`/`large` por número faria o atributo voltar.
 */
export const InitialsCircle = styled(Avatar, {
  shouldForwardProp: (prop) => prop !== 'size',
})<{ size: InitialsAvatarSize }>(({ theme, size }) => {
  const { fontSize, fontWeight, lineHeight } = theme.typography.h2;
  const bodyBySize = {
    small: theme.typography.captionBold,
    large: theme.typography.subtitleBold,
    portrait: { fontSize, fontWeight, lineHeight },
  };

  return {
    width: `${DIAMETER_PX[size]}px`,
    height: `${DIAMETER_PX[size]}px`,
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    ...bodyBySize[size],
  };
});

export const LoadingCircle = styled(Skeleton, {
  shouldForwardProp: (prop) => prop !== 'size',
})<{ size: InitialsAvatarSize }>(({ size }) => ({
  width: `${DIAMETER_PX[size]}px`,
  height: `${DIAMETER_PX[size]}px`,
  flexShrink: 0,

  '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
}));
