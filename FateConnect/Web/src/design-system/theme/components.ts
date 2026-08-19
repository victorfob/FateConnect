import type { Components, Theme } from '@mui/material/styles';

import { radiusScale, shadowTokens, spacingScale, typographyTokens } from '../tokens';
import { chromeSurface, inputOutline } from './chromeSurface';
import { radius } from './helpers/radius';
import { spacing } from './helpers/spacing';

const { xxs, md } = spacingScale;

/** Overrides de componente do MUI alinhados ao visual já implementado no produto. */
export const components: Components<Theme> = {
  MuiButton: {
    defaultProps: { disableElevation: true },
    styleOverrides: { root: { textTransform: 'none' } },
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
  MuiDialog: { styleOverrides: { paper: { borderRadius: radius(radiusScale.lg) } } },
  MuiAppBar: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: ({ theme }) => ({ backgroundColor: chromeSurface(theme) }),
    },
  },
};
