import type { ImgHTMLAttributes } from 'react';
import {
  Box,
  compactMedia,
  iconSizeTokens,
  PolymorphicBox,
  PolymorphicStack,
  radiusScale,
  shadowTokens,
  spacingScale,
  Stack,
  styled,
} from '@design-system';

const { xxs, sm, md, xxl } = spacingScale;

const PHOTO_SIZE_PX = 96;

const OWN_ITEM_BORDER_PX = 4;

/** A faixa na borda é o que diz, sem etiqueta, que o item é de quem olha. */
export const CardRoot = styled(PolymorphicStack, {
  // `own` é só para o estilo: sem isto o Stack a repassa e o React reclama do atributo.
  shouldForwardProp: (prop) => prop !== 'own',
})<{ own: boolean }>(({ theme, own }) => ({
  flexDirection: 'row',
  borderLeft: own ? `${OWN_ITEM_BORDER_PX}px solid ${theme.palette.secondary.main}` : 'none',
  alignItems: 'flex-start',
  gap: theme.space(md),
  width: '100%',
  marginBottom: theme.space(md),
  padding: theme.space(md),
  borderRadius: theme.radius(radiusScale.component),
  boxShadow: shadowTokens.component,
  background: theme.palette.background.paper,
  color: theme.palette.text.primary,

  [compactMedia]: { flexDirection: 'column' },
}));

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

export const CardBody = styled(Stack)({
  flexDirection: 'column',
  flexGrow: 1,
  minWidth: 0,
});

export const HeaderRow = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: theme.space(sm),
  marginBottom: theme.space(sm),
}));

export const HeaderActions = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  flexShrink: 0,
  gap: theme.space(sm),
}));

export const InfoRow = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  flexWrap: 'wrap',
  columnGap: theme.space(xxl),
  rowGap: theme.space(xxs),
  marginBottom: theme.space(sm),
  color: theme.palette.text.secondary,
}));

export const InfoItem = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.space(xxs),

  '& svg': {
    color: theme.palette.secondary.main,
    fontSize: `${iconSizeTokens.sm}px`,
  },
}));

export const Description = styled(Box)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

export const CancellationNote = styled(Box)(({ theme }) => ({
  marginTop: theme.space(xxs),
  color: theme.palette.text.secondary,
}));

/** A etiqueta acompanha o cabeçalho no desktop e desce no estreito. */
export const WideOnlyTag = styled(Box)({
  display: 'block',

  [compactMedia]: { display: 'none' },
});

export const CompactOnlyTag = styled(Box)(({ theme }) => ({
  display: 'none',

  [compactMedia]: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: theme.space(sm),
  },
}));

/** Fora da tela, mas dentro da árvore de acessibilidade. */
export const ScreenReaderOnly = styled(PolymorphicBox)({
  position: 'absolute',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
});
