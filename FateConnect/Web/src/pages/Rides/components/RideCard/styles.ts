import {
  Box,
  compactMedia,
  iconSizeTokens,
  PolymorphicStack,
  radiusScale,
  shadowTokens,
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
  marginBottom: theme.space(md),
  padding: theme.space(md),
  borderRadius: theme.radius(radiusScale.component),
  boxShadow: shadowTokens.component,
  background: theme.palette.background.paper,
  color: theme.palette.text.primary,
}));

export const HeaderRow = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.space(sm),
}));

export const HeaderActions = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.space(sm),
}));

export const InfoRow = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  gap: INFO_ROW_GAP,
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
  marginBottom: theme.space(sm),
}));

export const ActionButtons = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',

  '& .MuiIconButton-root': {
    width: `${ACTION_BUTTON_SIZE_PX}px`,
    height: `${ACTION_BUTTON_SIZE_PX}px`,
    padding: theme.space(xxs),
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

export const CompactOnlyTag = styled(Box)(({ theme }) => ({
  display: 'none',

  [compactMedia]: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: theme.space(sm, 0),
  },
}));
