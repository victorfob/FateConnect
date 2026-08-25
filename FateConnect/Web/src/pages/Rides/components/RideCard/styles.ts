import {
  Box,
  compactMedia,
  iconSizeTokens,
  PolymorphicStack,
  radius,
  radiusScale,
  shadowTokens,
  spacing,
  spacingScale,
  Stack,
  styled,
} from '@design-system';

const { xxs, sm, md } = spacingScale;

/** Espaço entre as informações da carona, em unidade de viewport como no produto. */
const INFO_ROW_GAP = '5vw';
const ACTION_BUTTON_SIZE_PX = 32;
/** O glifo da biblioteca de origem ocupa 70% do botão. */
const ACTION_ICON_SCALE = 0.7;

export const CardRoot = styled(PolymorphicStack)(({ theme }) => ({
  flexDirection: 'column',
  width: '100%',
  marginBottom: spacing(md),
  padding: spacing(md),
  borderRadius: radius(radiusScale.component),
  boxShadow: shadowTokens.component,
  background: theme.palette.background.paper,
  color: theme.palette.text.primary,
}));

export const HeaderRow = styled(Stack)({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: spacing(sm),
});

export const HeaderActions = styled(Stack)({
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing(sm),
});

export const InfoRow = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  gap: INFO_ROW_GAP,
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
  marginBottom: spacing(sm),
}));

export const ActionButtons = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',

  '& .MuiIconButton-root': {
    width: `${ACTION_BUTTON_SIZE_PX}px`,
    height: `${ACTION_BUTTON_SIZE_PX}px`,
    padding: spacing(xxs),
    color: theme.palette.text.primary,
  },
  '& .MuiIconButton-root svg': {
    transform: `scale(${ACTION_ICON_SCALE})`,
    transformOrigin: 'center',
  },
}));

/** A etiqueta acompanha o cabeçalho no desktop e desce para o rodapé no estreito. */
export const WideOnlyTag = styled(Box)({
  display: 'block',

  [compactMedia]: { display: 'none' },
});

export const CompactOnlyTag = styled(Box)({
  display: 'none',

  [compactMedia]: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: spacing(sm, 0),
  },
});
