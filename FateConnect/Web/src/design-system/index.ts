/**
 * Ponto de entrada público do design system.
 *
 * A aplicação importa **apenas daqui** (`@ds`), nunca de um caminho interno —
 * é o que mantém barato extrair esta camada para um pacote no futuro.
 */
export * from './ui';
export { styled, css, keyframes, darken, lighten, alpha } from './styled';

export { Header } from './components/Header';
export { HEADER_HEIGHT_PX } from './components/Header/styles';
export { Footer } from './components/Footer';
export { NavigationDrawer } from './components/NavigationDrawer';

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
  MOBILE_MAX_WIDTH_PX,
  TABLET_MAX_WIDTH_PX,
  mobileMedia,
  tabletMedia,
} from './tokens';
export type { SpacingToken, RadiusToken, TypographyToken } from './tokens';
