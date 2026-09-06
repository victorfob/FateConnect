import type { Components, CSSObject, Theme } from '@mui/material/styles';

import { radiusScale, shadowTokens, spacingScale, typographyTokens } from '../tokens';
import { radius } from './helpers/radius';
import { spacing } from './helpers/spacing';

/** Fundo suficiente para cobrir o campo inteiro, de qualquer altura. */
const AUTOFILL_COVER_PX = 100;

const { none, xxs, xs, md } = spacingScale;

const SELECT_OPTION_MIN_HEIGHT_PX = 48;

export const components: Components<Theme> = {
  MuiButton: {
    styleOverrides: {
      // Retorno visual do botão, como no produto, em duas partes.
      //
      // 1. Véu preto a 4% por cima sob o cursor, para qualquer variante. Sem
      //    ele o botão de texto do topo não reage: o MUI deriva o realce de
      //    `text.primary`, que é a própria cor da marca, e 4% dela sobre o
      //    header da mesma cor não aparece.
      //
      // 2. Elevação ligada (sem `disableElevation`): o CTA do produto é
      //    `mat-raised-button`, com sombra em repouso e sombra maior no hover.
      //    A escala do MUI — 2, 4 e 8 — é exatamente a do Material.
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
      // Herdar do botão não pinta o indicador: no carregamento centrado o MUI
      // deixa o rótulo `transparent`, então a cor do texto é nomeada de novo aqui.
      loadingIndicator: ({ theme, ownerState }) => {
        const { color, variant } = ownerState;

        if (variant === 'soft') return { color: theme.palette.text.primary };
        // `color="inherit"` recebe a cor de quem envolve o botão, que este slot não lê.
        if (!color || color === 'inherit') return {};
        if (variant === 'contained') return { color: theme.palette[color].contrastText };

        return { color: theme.palette[color].main };
      },
    },
    variants: [
      {
        props: { variant: 'soft' },
        style: ({ theme }) => ({
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: radius(radiusScale.component),
          color: theme.palette.text.primary,
          padding: spacing(xs, md),
        }),
      },
    ],
  },
  MuiCard: {
    styleOverrides: {
      root: { borderRadius: radius(radiusScale.lg), boxShadow: shadowTokens.component },
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      // O raio de 10px vale para cartão, diálogo e botão — não para o campo, que
      // no produto usa o raio padrão do Material.
      root: ({ theme }) => ({
        borderRadius: radius(radiusScale.sm),
        // A sombra abaixo alcança só o `input`, e o campo com adorno é mais
        // largo que ele: sem isto a faixa atrás do botão fica com a cor do
        // cartão e o campo sai em dois tons.
        '&:has(input:-webkit-autofill)': { backgroundColor: theme.palette.inputAutofill },
      }),
      notchedOutline: ({ theme }) => ({ borderColor: theme.palette.inputOutline }),
      // O navegador pinta o campo preenchido pela folha dele, e `background-color`
      // não vence: o fundo se cobre com sombra interna, e o glifo e o cursor têm
      // chaves próprias. Cada estado repete a regra porque o Chrome repinta a
      // cada hover e foco.
      input: ({ theme }) => {
        const filled: CSSObject = {
          boxShadow: `inset 0 0 0 ${AUTOFILL_COVER_PX}px ${theme.palette.inputAutofill}`,
          WebkitTextFillColor: theme.palette.text.primary,
          caretColor: theme.palette.text.primary,
        };

        return {
          '&:-webkit-autofill': filled,
          '&:-webkit-autofill:hover': filled,
          '&:-webkit-autofill:focus': filled,
          '&:-webkit-autofill:active': filled,
        };
      },
    },
  },
  MuiFormHelperText: {
    styleOverrides: {
      root: {
        ...typographyTokens.formHelper,
        // O MUI afasta a mensagem em 3px e a alinha a 14px; o produto encosta
        // no campo e alinha a 16px. Os 3px somavam altura em cada campo com erro.
        margin: spacing(none, md),
      },
    },
  },
  MuiCheckbox: {
    // No produto a caixa marcada usa a cor de destaque, não a primária.
    defaultProps: { color: 'secondary' },
  },
  MuiFormControlLabel: {
    styleOverrides: {
      root: { marginLeft: spacing(none), marginRight: spacing(none) },
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
        padding: spacing(none, md),
        // Aqui o `sm` é do MUI, não do produto: esta linha desfaz o
        // `min-width:600px` que o próprio MuiMenuItem aplica.
        // eslint-disable-next-line no-restricted-syntax
        [theme.breakpoints.up('sm')]: {
          minHeight: `${SELECT_OPTION_MIN_HEIGHT_PX}px`,
        },
      }),
    },
  },
  // O `Paper` do MUI clareia a superfície por elevação no tema escuro: no
  // diálogo isso levava `#1E1E1E` a `#434343`, e o contraste medido no token
  // deixava de valer para o que a tela desenhava.
  MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
  MuiDialog: { styleOverrides: { paper: { borderRadius: radius(radiusScale.lg) } } },
  // O esqueleto pisca por gradiente, não pela opacidade do `pulse` padrão: a 40%
  // de opacidade a cor pintada deixa de ser a que `contrast.test.ts` mede.
  MuiSkeleton: {
    defaultProps: { variant: 'rectangular', animation: 'wave' },
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor: theme.palette.skeleton,
        borderRadius: radius(radiusScale.sm),
      }),
    },
  },
  MuiAppBar: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: ({ theme }) => ({ backgroundColor: theme.palette.chrome.main }),
    },
  },
};
