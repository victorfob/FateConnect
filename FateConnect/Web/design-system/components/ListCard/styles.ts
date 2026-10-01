import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { PolymorphicStack } from '@ds-root/polymorphic';
import { styled } from '@ds-root/styled';
import { iconSizeTokens, radiusScale, shadowTokens, spacingScale } from '@ds-root/tokens';

import {
  ACTIONS_ATTRIBUTE,
  BODY_ATTRIBUTE,
  HEADER_ATTRIBUTE,
  INFO_ROW_ATTRIBUTE,
  MEDIA_ATTRIBUTE,
} from './constants';

const { none, xxs, sm, md } = spacingScale;

const OWN_STRIPE_PX = 4;
const HAIRLINE = '1px';
/** Alvo de toque no mínimo aceitável: o glifo cresce dentro dele, ele não encolhe. */
const ACTION_BUTTON_SIZE_PX = 32;

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

    // Com mídia, a etiqueta e as ações sobem para o topo e o título e a fileira
    // ficam ao lado da miniatura, que deixaria a faixa à direita vazia. O corpo
    // e o cabeçalho somem da caixa para os filhos entrarem direto na grade.
    ...(hasMedia && {
      display: 'grid',
      gridTemplateColumns: 'auto minmax(0, 1fr)',
      gridTemplateRows: 'auto auto 1fr',
      gridTemplateAreas: '"actions actions" "media title" "media info"',
      rowGap: theme.space(none),

      [`& [${BODY_ATTRIBUTE}], & [${HEADER_ATTRIBUTE}]`]: { display: 'contents' },
      [`& [${ACTIONS_ATTRIBUTE}]`]: {
        gridArea: 'actions',
        justifyContent: 'space-between',
        marginBottom: theme.space(sm),
      },
      [`& [${MEDIA_ATTRIBUTE}]`]: { gridArea: 'media', marginBottom: theme.space(sm) },
      [`& [${HEADER_ATTRIBUTE}] > :not([${ACTIONS_ATTRIBUTE}])`]: {
        gridArea: 'title',
        marginBottom: theme.space(sm),
      },
      [`& [${INFO_ROW_ATTRIBUTE}]`]: { gridArea: 'info', alignSelf: 'start' },
      [`& [${BODY_ATTRIBUTE}] > :not([${HEADER_ATTRIBUTE}], [${INFO_ROW_ATTRIBUTE}])`]: {
        gridColumn: '1 / -1',
      },
    }),
  },
}));

export const MediaSlot = styled(Box)({ flexShrink: 0 });

export const CardBody = styled(Stack)(({ theme }) => ({
  flexDirection: 'column',
  flexGrow: 1,
  minWidth: 0,
  // Herdado por título, fileira e descrição: uma palavra ou um e-mail sem
  // espaço passaria da borda do cartão e alargaria a página no celular.
  overflowWrap: 'anywhere',

  // No estreito o cartão vira coluna, e aí o `flex-start` do topo encolheria o
  // corpo até o conteúdo: o cabeçalho pararia antes da borda, em lugar
  // diferente a cada cartão.
  [theme.breakpoints.down('md')]: { width: '100%' },
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
  // O glifo do MUI mede `1em`, então o token vai no `font-size`. Com 24px ele
  // ocupa o botão inteiro menos o recuo, sem encostar na borda.
  '& .MuiIconButton-root svg': {
    fontSize: `${iconSizeTokens.md}px`,
  },
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

  [theme.breakpoints.down('md')]: { '&::before': { display: 'none' } },
}));
