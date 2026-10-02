import { autocompleteClasses } from '@mui/material/Autocomplete';
import type { Components, CSSObject, Theme } from '@mui/material/styles';

import {
  buttonHeightTokens,
  radiusScale,
  shadowTokens,
  spacingScale,
  typographyTokens,
  type ButtonSizeToken,
} from '../tokens';
import { radius } from './helpers/radius';
import { spacing } from './helpers/spacing';

/** Fundo suficiente para cobrir o campo inteiro, de qualquer altura. */
const AUTOFILL_COVER_PX = 100;

const { none, xxs, xs, md } = spacingScale;

const PANEL_OPTION_MIN_HEIGHT_PX = 48;
/** A elevação que o `Menu` do MUI dá ao painel do `select`. */
const SELECT_PANEL_ELEVATION = 8;

const SWITCH_WIDTH_PX = 48;
const SWITCH_HEIGHT_PX = 30;
const SWITCH_TRACK_RADIUS_PX = 15;
const SWITCH_THUMB_TRAVEL_PX = 18;

/**
 * A opção dos painéis de escolha (o do `select` e o das sugestões) tem 48px de
 * altura e recuo só na horizontal. O MUI declara os mesmos 48px e **desfaz** num
 * `@media (min-width:600px)`, então o valor se repete dentro do breakpoint.
 */
function panelOption(theme: Theme): CSSObject {
  return {
    minHeight: `${PANEL_OPTION_MIN_HEIGHT_PX}px`,
    padding: spacing(none, md),
    // Aqui o `sm` é do MUI, não do produto: é o breakpoint em que ele encolhe a opção.
    // eslint-disable-next-line no-restricted-syntax
    [theme.breakpoints.up('sm')]: { minHeight: `${PANEL_OPTION_MIN_HEIGHT_PX}px` },
  };
}

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

        // O MUI troca o fundo do preenchido pelo tom `dark` no hover, o que somado
        // ao véu escurece o dobro. Fixar a cor base deixa o véu como único realce;
        // o desabilitado fica de fora porque, no toque, o hover segue preso ao botão.
        if (ownerState.variant !== 'contained') return veil;
        if (ownerState.color !== 'secondary' && ownerState.color !== 'error') return veil;

        return {
          ...veil,
          '&:hover:not(.Mui-disabled)': { backgroundColor: theme.palette[ownerState.color].main },
        };
      },
      // Herdar do botão não pinta o indicador: no carregamento centrado o MUI
      // deixa o rótulo `transparent`, então a cor do texto é nomeada de novo aqui.
      loadingIndicator: ({ theme, ownerState }) => {
        const { color, variant } = ownerState;

        if (variant === 'soft') return { color: theme.palette.text.primary };
        if (variant === 'destructive') return { color: theme.palette.brandText };
        // `color="inherit"` recebe a cor de quem envolve o botão, que este slot não lê.
        if (!color || color === 'inherit') return {};
        if (variant === 'contained') return { color: theme.palette[color].contrastText };

        return { color: theme.palette[color].main };
      },
    },
    variants: [
      {
        props: { variant: 'contained' },
        style: { borderRadius: radius(radiusScale.component) },
      },
      {
        props: { variant: 'soft' },
        style: ({ theme }) => ({
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: radius(radiusScale.component),
          color: theme.palette.text.primary,
          padding: spacing(xs, md),
        }),
      },
      {
        // O vermelho da marca como texto: `secondary.main` é fundo de botão e como texto reprova.
        props: { variant: 'destructive' },
        style: ({ theme }) => ({
          border: `1px solid ${theme.palette.brandText}`,
          borderRadius: radius(radiusScale.component),
          color: theme.palette.brandText,
          padding: spacing(xs, md),
        }),
      },
      {
        props: { size: 'medium' },
        style: {
          minHeight: `${buttonHeightTokens.medium}px`,
          paddingTop: spacing(none),
          paddingBottom: spacing(none),
        },
      },
      {
        props: { size: 'small' },
        style: {
          ...typographyTokens.caption,
          minHeight: `${buttonHeightTokens.small}px`,
          paddingTop: spacing(none),
          paddingBottom: spacing(none),
        },
      },
      {
        props: { size: 'large' },
        style: {
          minHeight: `${buttonHeightTokens.large}px`,
          paddingTop: spacing(none),
          paddingBottom: spacing(none),
        },
      },
      {
        props: { variant: 'chrome' },
        style: ({ theme }) => ({
          borderRadius: radius(radiusScale.component),
          color: theme.palette.chrome.contrastText,
          backgroundColor: theme.palette.chrome.main,
          boxShadow: shadowTokens.component,
          padding: spacing(none, md),
        }),
      },
    ],
  },
  MuiIconButton: {
    variants: (['small', 'medium', 'large'] satisfies ButtonSizeToken[]).map((size) => ({
      props: { size },
      style: {
        width: `${buttonHeightTokens[size]}px`,
        height: `${buttonHeightTokens[size]}px`,
        padding: spacing(none),
      },
    })),
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
        // no campo e alinha a 16px. Os 3px somariam altura em cada campo com erro.
        margin: spacing(none, md),
      },
    },
  },
  /**
   * Interruptor no desenho do iOS: trilho sólido do tamanho do polegar, sem o véu
   * translúcido do Material, que deixa o desligado abaixo do mínimo de 3:1.
   */
  MuiSwitch: {
    defaultProps: { disableRipple: true },
    styleOverrides: {
      root: {
        width: `${SWITCH_WIDTH_PX}px`,
        height: `${SWITCH_HEIGHT_PX}px`,
        padding: spacing(none),
      },
      switchBase: ({ theme }) => ({
        padding: spacing(xxs),
        // O polegar lê `currentColor`, e sem isto ele sai no cinza do Material.
        color: theme.palette.common.white,
        '&.Mui-checked': {
          color: theme.palette.common.white,
          transform: `translateX(${SWITCH_THUMB_TRAVEL_PX}px)`,
          '& + .MuiSwitch-track': {
            backgroundColor: theme.palette.secondary.main,
            opacity: 1,
          },
        },
      }),
      track: ({ theme }) => ({
        borderRadius: `${SWITCH_TRACK_RADIUS_PX}px`,
        backgroundColor: theme.palette.switchTrack,
        opacity: 1,
        transition: theme.transitions.create('background-color'),
      }),
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
  MuiMenuItem: { styleOverrides: { root: ({ theme }) => panelOption(theme) } },
  MuiAutocomplete: {
    defaultProps: { slotProps: { paper: { elevation: SELECT_PANEL_ELEVATION } } },
    styleOverrides: {
      listbox: ({ theme }) => ({ [`& .${autocompleteClasses.option}`]: panelOption(theme) }),
    },
  },
  // O `Paper` do MUI clareia a superfície por elevação no tema escuro, e o
  // contraste medido no token deixaria de valer para o que a tela desenha.
  MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
  MuiDialog: { styleOverrides: { paper: { borderRadius: radius(radiusScale.lg) } } },
  // O esqueleto pisca por gradiente, não pela opacidade do `pulse` padrão: a 40%
  // de opacidade a cor pintada deixa de ser a que `contrast.test.ts` mede.
  MuiSkeleton: {
    defaultProps: { variant: 'rectangular', animation: 'wave' },
    styleOverrides: {
      root: ({ theme }) => ({ backgroundColor: theme.palette.skeleton }),
      rectangular: { borderRadius: radius(radiusScale.sm) },
    },
  },
  MuiAppBar: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: ({ theme }) => ({ backgroundColor: theme.palette.chrome.main }),
    },
  },
};
