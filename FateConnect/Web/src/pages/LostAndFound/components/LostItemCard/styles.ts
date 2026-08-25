import type { ImgHTMLAttributes } from 'react';
import {
  Box,
  compactMedia,
  iconSizeTokens,
  PolymorphicBox,
  PolymorphicStack,
  radius,
  radiusScale,
  shadowTokens,
  spacing,
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
  gap: spacing(md),
  width: '100%',
  marginBottom: spacing(md),
  padding: spacing(md),
  borderRadius: radius(radiusScale.component),
  boxShadow: shadowTokens.component,
  background: theme.palette.background.paper,
  color: theme.palette.text.primary,

  [compactMedia]: { flexDirection: 'column' },
}));

export const Photo = styled(PolymorphicBox)<
  Pick<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'>
>({
  width: `${PHOTO_SIZE_PX}px`,
  height: `${PHOTO_SIZE_PX}px`,
  flexShrink: 0,
  objectFit: 'cover',
  borderRadius: radius(radiusScale.md),
});

/** Sem foto o espaço continua ocupado, para o cartão não mudar de altura. */
export const PhotoPlaceholder = styled(Stack)(({ theme }) => ({
  width: `${PHOTO_SIZE_PX}px`,
  height: `${PHOTO_SIZE_PX}px`,
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: radius(radiusScale.md),
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

export const HeaderRow = styled(Stack)({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: spacing(sm),
  marginBottom: spacing(sm),
});

export const HeaderActions = styled(Stack)({
  flexDirection: 'row',
  alignItems: 'center',
  flexShrink: 0,
  gap: spacing(sm),
});

export const InfoRow = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  flexWrap: 'wrap',
  columnGap: spacing(xxl),
  rowGap: spacing(xxs),
  marginBottom: spacing(sm),
  color: theme.palette.text.secondary,
}));

export const InfoItem = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing(xxs),

  '& svg': {
    color: theme.palette.secondary.main,
    fontSize: `${iconSizeTokens.sm}px`,
  },
}));

export const Description = styled(Box)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

export const CancellationNote = styled(Box)(({ theme }) => ({
  marginTop: spacing(xxs),
  color: theme.palette.text.secondary,
}));

/** A etiqueta acompanha o cabeçalho no desktop e desce no estreito. */
export const WideOnlyTag = styled(Box)({
  display: 'block',

  [compactMedia]: { display: 'none' },
});

export const CompactOnlyTag = styled(Box)({
  display: 'none',

  [compactMedia]: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: spacing(sm),
  },
});

/** Fora da tela, mas dentro da árvore de acessibilidade. */
export const ScreenReaderOnly = styled(PolymorphicBox)({
  position: 'absolute',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
});
