/**
 * Ponto de entrada público do design system — componentes, estilo e os tokens
 * que a aplicação de fato consome. Os ícones têm o seu próprio barrel, em
 * `@design-system/icons`.
 *
 * Aqui só entra o que pode ser usado direto na aplicação: o que é matéria-prima
 * do tema — paleta, tipografia, fábrica do tema — fica interno de propósito.
 */
export * from './ui';
export { styled, css, keyframes, darken, lighten, alpha } from './styled';
export type { PolymorphicProps } from './styled';

export { Header } from './components/Header';
export { HEADER_HEIGHT_PX } from './components/Header/styles';
export { Footer } from './components/Footer';
export { NavigationDrawer } from './components/NavigationDrawer';
export { InitialsAvatar } from './components/InitialsAvatar';
export { ConfirmDialog } from './components/ConfirmDialog';
export { NotificationProvider } from './components/NotificationProvider';
export { PageMessage } from './components/PageMessage';
export type { PageMessageProps } from './components/PageMessage';
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
export { spacing, radius } from './theme';
export {
  spacingScale,
  radiusScale,
  shadowTokens,
  iconSizeTokens,
  compactMedia,
  mobileMedia,
  tabletMedia,
  desktopMedia,
} from './tokens';
