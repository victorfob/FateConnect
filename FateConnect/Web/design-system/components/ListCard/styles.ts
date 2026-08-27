import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { PolymorphicStack } from '@ds-root/polymorphic';
import { styled } from '@ds-root/styled';
import { iconSizeTokens, radiusScale, shadowTokens, spacingScale } from '@ds-root/tokens';

import { ACTIONS_ATTRIBUTE } from './constants';

const { xxs, sm, md } = spacingScale;

const OWN_STRIPE_PX = 4;
const HAIRLINE = '1px';
const ACTION_BUTTON_SIZE_PX = 32;
/** O glifo da biblioteca de origem ocupa 70% do botão. */
const ACTION_ICON_SCALE = 0.7;

const STYLE_ONLY_PROPS: ReadonlySet<string> = new Set(['own', 'hasMedia']);

/** A faixa na borda é o que diz, sem etiqueta, que o registro é de quem olha. */
export const CardRoot = styled(PolymorphicStack, {
  // São só para o estilo: sem isto o Stack as repassa e o React reclama do atributo.
  shouldForwardProp: (prop) => !STYLE_ONLY_PROPS.has(String(prop)),
})<{ own: boolean; hasMedia: boolean }>(({ theme, own, hasMedia }) => ({
  position: 'relative',
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

  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',

    // Com a mídia no topo, o cabeçalho desce com ela e a etiqueta sairia do
    // canto. Tirá-la do fluxo é o que a mantém lá — e só há espaço para isso
    // porque a mídia é uma miniatura, deixando a faixa à direita dela vazia.
    ...(hasMedia && {
      [`& [${ACTIONS_ATTRIBUTE}]`]: {
        position: 'absolute',
        top: theme.space(md),
        right: theme.space(md),
      },
    }),
  },
}));

export const CardBody = styled(Stack)(({ theme }) => ({
  flexDirection: 'column',
  flexGrow: 1,
  minWidth: 0,

  // No estreito o cartão vira coluna, e aí o `flex-start` do topo encolheria o
  // corpo até o conteúdo: o cabeçalho pararia antes da borda, em lugar
  // diferente a cada cartão.
  [theme.breakpoints.down('md')]: { width: '100%' },
}));

export const HeaderRow = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: theme.space(sm),
  marginBottom: theme.space(sm),

  // Sem os dois o título empurra a etiqueta e as ações para fora do cartão no
  // estreito: o `minWidth` é o que deixa a caixa encolher, e a quebra é o que
  // impede uma palavra sem espaço de correr por cima delas.
  '& > :first-of-type': { minWidth: 0, overflowWrap: 'anywhere' },
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
  columnGap: theme.space(md),
  rowGap: theme.space(xxs),
  marginBottom: theme.space(sm),
  // Cada item desenha a barra à sua esquerda, dentro do vão. É este recorte que
  // apaga a do primeiro item de cada linha — inclusive a da linha que quebrou.
  overflow: 'hidden',
  color: theme.palette.text.secondary,
}));

export const InfoItem = styled(Stack)(({ theme }) => ({
  position: 'relative',
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.space(xxs),

  // Desenhada como fundo, e não como caractere, para o leitor de tela ler a
  // informação e não a separação.
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: `calc(${theme.space(md)} / -2)`,
    width: HAIRLINE,
    backgroundColor: theme.palette.divider,
  },

  '& svg': {
    color: theme.palette.brandText,
    fontSize: `${iconSizeTokens.sm}px`,
  },
}));

export const Description = styled(Box)(({ theme }) => ({
  marginBottom: theme.space(sm),
  color: theme.palette.text.secondary,
}));
