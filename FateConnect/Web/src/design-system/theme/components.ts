import type { CSSObject, Components, Theme } from '@mui/material/styles';

import { radiusScale, shadowTokens, spacingScale, typographyTokens } from '../tokens';
import { chromeSurface, inputOutline } from './chromeSurface';
import { radius } from './helpers/radius';
import { spacing } from './helpers/spacing';

const { xxs, md } = spacingScale;

/** Altura da linha no painel do `select`, como no produto. */
const SELECT_OPTION_MIN_HEIGHT_PX = 48;

/** Overrides de componente do MUI alinhados ao visual já implementado no produto. */
export const components: Components<Theme> = {
  MuiButton: {
    defaultProps: { disableElevation: true },
    styleOverrides: {
      // O produto escurece **qualquer** botão com um véu preto a 4% sob o
      // cursor, por overlay, em vez de trocar a cor de fundo por variante.
      //
      // Sem isso não há retorno visual: no botão preenchido o MUI só muda a
      // sombra, que `disableElevation` já removeu; e no botão de texto do topo
      // ele deriva de `text.primary`, que é a própria cor da marca — 4% dela
      // sobre o header da cor da marca não aparece.
      root: ({ theme, ownerState }) => {
        const veil: CSSObject = {
          textTransform: 'none',
          position: 'relative',

          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            backgroundColor: theme.palette.action.hover,
            opacity: 0,
            transition: theme.transitions.create('opacity'),
            pointerEvents: 'none',
          },

          // Em toque não existe cursor: o véu ficaria preso depois do toque.
          '@media (hover: hover)': {
            '&:hover::after': { opacity: 1 },
          },
        };

        // O MUI troca o fundo do botão preenchido pelo tom `dark` no hover, o
        // que somado ao véu escurece o dobro do produto. Fixar o fundo na cor
        // base deixa o véu ser o único escurecimento.
        if (ownerState.variant !== 'contained') return veil;
        if (ownerState.color !== 'secondary' && ownerState.color !== 'error') return veil;

        return { ...veil, '&:hover': { backgroundColor: theme.palette[ownerState.color].main } };
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: { borderRadius: radius(radiusScale.lg), boxShadow: shadowTokens.component },
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      // O raio de 10px vale para cartão, diálogo e botão — não para o campo, que
      // no produto usa o raio padrão do Material. Medido em `/cadastro` e no login.
      root: { borderRadius: radius(radiusScale.sm) },
      notchedOutline: ({ theme }) => ({ borderColor: inputOutline(theme) }),
    },
  },
  MuiFormHelperText: {
    styleOverrides: {
      root: {
        ...typographyTokens.formHelper,
        // O MUI afasta a mensagem em 3px e a alinha a 14px; o produto encosta
        // no campo e alinha a 16px. Os 3px somavam altura em cada campo com erro.
        margin: spacing(0, md),
      },
    },
  },
  MuiCheckbox: {
    // No produto a caixa marcada usa a cor de destaque, não a primária.
    defaultProps: { color: 'secondary' },
  },
  MuiFormControlLabel: {
    styleOverrides: {
      root: { marginLeft: 0, marginRight: 0 },
      label: { paddingLeft: spacing(xxs) },
    },
  },
  // A opção do painel do `select` no produto tem 48px de altura e recuo só na
  // horizontal; o padrão do MUI é mais baixo, o que encurtava todo dropdown do
  // app — com 27 opções no estado, a diferença compõe.
  //
  // O valor precisa ser repetido dentro do breakpoint: o MUI declara os mesmos
  // 48px e **desfaz** num `@media (min-width:600px)` com `minHeight: 'auto'`.
  // Sobrescrever só a base deixa a linha encolher no desktop — e, sem o recuo
  // vertical dele, ela colapsa na altura do texto.
  MuiMenuItem: {
    styleOverrides: {
      root: ({ theme }) => ({
        minHeight: `${SELECT_OPTION_MIN_HEIGHT_PX}px`,
        padding: spacing(0, md),
        [theme.breakpoints.up('sm')]: {
          minHeight: `${SELECT_OPTION_MIN_HEIGHT_PX}px`,
        },
      }),
    },
  },
  MuiDialog: { styleOverrides: { paper: { borderRadius: radius(radiusScale.lg) } } },
  MuiAppBar: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: ({ theme }) => ({ backgroundColor: chromeSurface(theme) }),
    },
  },
};
