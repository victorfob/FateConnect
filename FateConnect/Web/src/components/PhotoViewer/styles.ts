import { radiusScale, Stack, styled } from '@design-system';

const OVERLAY_OPACITY = 0.55;

export const ViewerTrigger = styled(Stack)(({ theme }) => ({
  position: 'relative',
  flexShrink: 0,
  borderRadius: theme.radius(radiusScale.md),

  '&[data-shape="circle"]': { borderRadius: theme.radius(radiusScale.circle) },
}));

export const ViewerOverlay = styled(Stack)(({ theme }) => ({
  position: 'absolute',
  inset: 0,
  alignItems: 'stretch',
  justifyContent: 'stretch',
  borderRadius: 'inherit',
  backgroundColor: theme.palette.common.black,
  opacity: 0,
  transition: theme.transitions.create('opacity'),

  // ⛔ O alvo é o véu inteiro, não o ícone: quem toca a foto a abre sem mirar.
  // O filho direto é o invólucro do tooltip, que encolhe até o conteúdo se
  // ninguém o esticar.
  '& > *': { flex: 1, display: 'flex' },

  '& button': {
    width: '100%',
    height: '100%',
    borderRadius: 'inherit',
    color: theme.palette.common.white,
  },

  // O véu cobre a foto inteira, então o cursor sobre ela é cursor sobre ele.
  // ⛔ Não usar `${ViewerTrigger} &`: seletor de componente do Emotion depende do
  // plugin de babel, que este projeto não liga, e a regra some.
  '&:hover, &:focus-within': { opacity: OVERLAY_OPACITY },

  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
}));
