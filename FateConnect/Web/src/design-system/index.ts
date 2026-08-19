/**
 * Ponto de entrada público do design system.
 *
 * A aplicação importa **apenas daqui** (`@ds`), nunca de um caminho interno —
 * é o que mantém barato extrair esta camada para um pacote no futuro.
 */
export { ThemeProvider } from './ThemeProvider';
export { GlobalStyles } from './GlobalStyles';
export { createAppTheme, spacing, radius, components } from './theme';
export {
  spacingScale,
  radiusScale,
  colorTokens,
  shadowTokens,
  iconSizeTokens,
  fontFamily,
  typographyTokens,
} from './tokens';
export type { SpacingToken, RadiusToken, TypographyToken } from './tokens';
