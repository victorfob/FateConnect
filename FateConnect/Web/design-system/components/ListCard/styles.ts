import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { PolymorphicStack } from '@ds-root/polymorphic';
import { styled } from '@ds-root/styled';
import { iconSizeTokens, radiusScale, shadowTokens, spacingScale } from '@ds-root/tokens';

const { xxs, sm, md, xl } = spacingScale;

const OWN_STRIPE_PX = 4;
const ACTION_BUTTON_SIZE_PX = 32;
/** O glifo da biblioteca de origem ocupa 70% do botão. */
const ACTION_ICON_SCALE = 0.7;

/** A faixa na borda é o que diz, sem etiqueta, que o registro é de quem olha. */
export const CardRoot = styled(PolymorphicStack, {
  // `own` é só para o estilo: sem isto o Stack a repassa e o React reclama do atributo.
  shouldForwardProp: (prop) => prop !== 'own',
})<{ own: boolean }>(({ theme, own }) => ({
  flexDirection: 'row',
  alignItems: 'flex-start',
  gap: theme.space(md),
  width: '100%',
  marginBottom: theme.space(md),
  padding: theme.space(md),
  borderLeft: own ? `${OWN_STRIPE_PX}px solid ${theme.palette.secondary.main}` : 'none',
  borderRadius: theme.radius(radiusScale.component),
  boxShadow: shadowTokens.component,
  background: theme.palette.background.paper,
  color: theme.palette.text.primary,

  [theme.breakpoints.down('md')]: { flexDirection: 'column' },
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

export const ActionButtons = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',

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

export const InfoRow = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  flexWrap: 'wrap',
  columnGap: theme.space(xl),
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
  marginBottom: theme.space(sm),
  color: theme.palette.text.secondary,
}));

/** A etiqueta acompanha o cabeçalho no desktop e desce para o rodapé no estreito. */
export const WideOnlyTag = styled(Box)(({ theme }) => ({
  display: 'block',

  [theme.breakpoints.down('md')]: { display: 'none' },
}));

export const CompactOnlyTag = styled(Box)(({ theme }) => ({
  display: 'none',

  [theme.breakpoints.down('md')]: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: theme.space(sm),
  },
}));
