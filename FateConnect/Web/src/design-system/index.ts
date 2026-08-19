/**
 * Ponto de entrada público do design system.
 *
 * A aplicação importa **apenas daqui** (`@ds`), nunca de um caminho interno —
 * é o que mantém barato extrair esta camada para um pacote no futuro.
 */
export * from './ui';
export { styled, css, keyframes, darken, lighten, alpha } from './styled';
export type { PolymorphicProps } from './styled';

export { Header } from './components/Header';
export { HEADER_HEIGHT_PX } from './components/Header/styles';
export { Footer } from './components/Footer';
export { NavigationDrawer } from './components/NavigationDrawer';
export { ConfirmDialog } from './components/ConfirmDialog';
export { StatusTag } from './components/StatusTag';
export type { StatusTagProps } from './components/StatusTag';
export type { StatusTagTone } from './components/StatusTag/types';
export type { ConfirmDialogProps } from './components/ConfirmDialog';
export type { DialogMessageProps } from './components/ConfirmDialog/DialogMessage';

export { ThemeProvider } from './ThemeProvider';
export { DateLocalizationProvider } from './DateLocalizationProvider';
export { useThemeMode } from './ThemeProvider/context/ThemeModeContext';
export { ThemeToggleButton } from './components/ThemeToggleButton';
export { GlobalStyles } from './GlobalStyles';
export { createAppTheme, spacing, radius, components } from './theme';
export {
  spacingScale,
  radiusScale,
  shadowTokens,
  iconSizeTokens,
  fontFamily,
  typographyTokens,
  MOBILE_MAX_WIDTH_PX,
  TABLET_MAX_WIDTH_PX,
  COMPACT_MAX_WIDTH_PX,
  compactMedia,
  mobileMedia,
  tabletMedia,
  desktopMedia,
} from './tokens';
export type { SpacingToken, RadiusToken, TypographyToken } from './tokens';
