import type { Components, Theme } from '@mui/material/styles';

import { colorTokens, radiusScale, shadowTokens } from '../tokens';
import { radius } from './helpers/radius';

/** Overrides de componente do MUI alinhados ao visual já implementado no produto. */
export const components: Components<Theme> = {
  MuiButton: {
    defaultProps: { disableElevation: true },
    styleOverrides: {
      root: {
        textTransform: 'none',
        borderRadius: radius(radiusScale.component),
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: radius(radiusScale.lg),
        boxShadow: shadowTokens.component,
      },
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: { borderRadius: radius(radiusScale.component) },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: { borderRadius: radius(radiusScale.lg) },
    },
  },
  MuiAppBar: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: { backgroundColor: colorTokens.primary },
    },
  },
};
