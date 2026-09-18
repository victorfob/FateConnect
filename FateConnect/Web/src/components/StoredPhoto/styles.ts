import type { ImgHTMLAttributes } from 'react';
import {
  iconSizeTokens,
  PolymorphicBox,
  radiusScale,
  spacingScale,
  Stack,
  styled,
} from '@design-system';

const { xs } = spacingScale;

const OVERLAY_OPACITY = 0.55;

/**
 * O disco fica translúcido para não pesar sobre a foto. Medido: o glifo branco
 * sobre ele cai de 5,14:1 para 3,84:1 no pior fundo, acima do piso de 3:1.
 */
const BADGE_OPACITY = 0.8;

const PHOTO_SIZE_PX = 96;

export const Photo = styled(PolymorphicBox)<
  Pick<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'>
>(({ theme }) => ({
  width: `${PHOTO_SIZE_PX}px`,
  height: `${PHOTO_SIZE_PX}px`,
  flexShrink: 0,
  objectFit: 'cover',
  borderRadius: theme.radius(radiusScale.md),
}));

/** Sem foto o espaço continua ocupado, para o cartão não mudar de altura. */
export const PhotoPlaceholder = styled(Stack)(({ theme }) => ({
  width: `${PHOTO_SIZE_PX}px`,
  height: `${PHOTO_SIZE_PX}px`,
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: theme.radius(radiusScale.md),
  background: theme.palette.background.default,

  '& svg': {
    color: theme.palette.text.secondary,
    fontSize: `${iconSizeTokens.lg}px`,
  },
}));

export const DownloadTrigger = styled(Stack)({
  position: 'relative',
  flexShrink: 0,
});

export const DownloadOverlay = styled(Stack)(({ theme }) => ({
  position: 'absolute',
  inset: 0,
  alignItems: 'stretch',
  justifyContent: 'stretch',
  borderRadius: theme.radius(radiusScale.md),
  backgroundColor: theme.palette.common.black,
  opacity: 0,
  transition: theme.transitions.create('opacity'),

  // ⛔ O alvo é o véu inteiro, não o ícone: 96px em vez de 30px, e quem toca a
  // miniatura acerta o download sem mirar. O filho direto é o invólucro do
  // tooltip, que encolhe até o conteúdo se ninguém o esticar.
  '& > *': { flex: 1, display: 'flex' },

  '& button': {
    width: '100%',
    height: '100%',
    borderRadius: 'inherit',
    color: theme.palette.common.white,
  },

  // O véu cobre a miniatura inteira, então o cursor sobre ela é cursor sobre
  // ele. ⛔ Não usar `${DownloadTrigger} &`: seletor de componente do Emotion
  // depende do plugin de babel, que este projeto não liga, e a regra some.
  '&:hover, &:focus-within': { opacity: OVERLAY_OPACITY },

  /**
   * ⛔ Sem cursor o véu nunca se revela, e a ação fica invisível. Aqui ele sai de
   * cena e quem anuncia é o disco do ícone — que carrega o próprio fundo, porque
   * contraste sobre foto clara e cheia de detalhe não se consegue com véu. A
   * consulta é de `hover`, não de largura: notebook com tela sensível também não
   * tem cursor, e nenhum breakpoint o distingue.
   */
  '@media (hover: none)': {
    opacity: BADGE_OPACITY,
    backgroundColor: 'transparent',

    '& svg': {
      padding: theme.space(xs),
      boxSizing: 'content-box',
      borderRadius: theme.radius(radiusScale.circle),
      backgroundColor: theme.palette.secondary.main,
      color: theme.palette.secondary.contrastText,
    },
  },

  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
}));
