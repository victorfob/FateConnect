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
export { PolymorphicBox, PolymorphicStack } from './polymorphic';

export { Header } from './components/Header';
export { HEADER_HEIGHT_PX } from './components/Header/styles';
export { Footer } from './components/Footer';
export { NavigationDrawer } from './components/NavigationDrawer';
export { InitialsAvatar } from './components/InitialsAvatar';
export { Dialog } from './components/Dialog';
export { FilterPanel } from './components/FilterPanel';
export { HiddenField } from './components/HiddenField';
export type { FilterPanelProps } from './components/FilterPanel';
export { IconButton } from './components/IconButton';
export type { IconButtonProps } from './components/IconButton';
export { Input } from './components/Input';
export type { InputProps } from './components/Input';
export type { SelectOption } from './components/Input/components/SelectInput/types';
export { ListCard } from './components/ListCard';
export type { ListCardProps } from './components/ListCard';
export { NotificationProvider } from './components/NotificationProvider';
export { PageMessage } from './components/PageMessage';
export type { PageMessageProps } from './components/PageMessage';
export { PageShell } from './components/PageShell';
export type { PageShellProps } from './components/PageShell';
export { Pagination } from './components/Pagination';
export type { PaginationProps } from './components/Pagination';
export { StatusTag } from './components/StatusTag';
export type { StatusTagProps } from './components/StatusTag';
export type { StatusTagTone } from './theme/types';
export type { DialogProps } from './components/Dialog';

export { ThemeProvider } from './ThemeProvider';
export { DateLocalizationProvider } from './DateLocalizationProvider';
export { useThemeMode } from './ThemeProvider/context/ThemeModeContext';
export { ThemeToggleButton } from './components/ThemeToggleButton';
export { GlobalStyles } from './GlobalStyles';
export { spacingScale, radiusScale, shadowTokens, iconSizeTokens } from './tokens';
