/**
 * Componentes de UI expostos pelo design system.
 *
 * A aplicação importa daqui, nunca de `@mui/material` — é o que permite
 * envolver, substituir ou restringir um componente sem varrer o app inteiro.
 */
export { default as AppBar } from '@mui/material/AppBar';
export { default as Box } from '@mui/material/Box';
export { default as Button } from '@mui/material/Button';
export { default as Checkbox } from '@mui/material/Checkbox';
export { default as CircularProgress } from '@mui/material/CircularProgress';
export { default as Drawer } from '@mui/material/Drawer';
export { default as FormControlLabel } from '@mui/material/FormControlLabel';
export { default as InputAdornment } from '@mui/material/InputAdornment';
export { default as IconButton } from '@mui/material/IconButton';
export { default as List } from '@mui/material/List';
export { default as ListItemButton } from '@mui/material/ListItemButton';
export { default as ListItemText } from '@mui/material/ListItemText';
export { default as MenuItem } from '@mui/material/MenuItem';
export { default as Popover } from '@mui/material/Popover';
export { default as Stack } from '@mui/material/Stack';
export { default as TextField } from '@mui/material/TextField';
export { default as Toolbar } from '@mui/material/Toolbar';
export { default as Typography } from '@mui/material/Typography';

export type { ButtonProps } from '@mui/material/Button';
export type { TypographyProps } from '@mui/material/Typography';
export type { SvgIconComponent } from '@mui/icons-material';
export type { BoxProps } from '@mui/material/Box';

export { default as CalendarTodayIcon } from '@mui/icons-material/CalendarToday';
export { default as DirectionsCarIcon } from '@mui/icons-material/DirectionsCar';
export { default as DarkModeIcon } from '@mui/icons-material/DarkMode';
export { default as EmailIcon } from '@mui/icons-material/Email';
export { default as LightModeIcon } from '@mui/icons-material/LightMode';
export { default as GroupsIcon } from '@mui/icons-material/Groups';
export { default as LocationOnIcon } from '@mui/icons-material/LocationOn';
export { default as MenuIcon } from '@mui/icons-material/Menu';
export { default as PhoneIcon } from '@mui/icons-material/Phone';
export { default as SearchIcon } from '@mui/icons-material/Search';
export { default as SecurityIcon } from '@mui/icons-material/Security';
export { default as VisibilityIcon } from '@mui/icons-material/Visibility';
export { default as VisibilityOffIcon } from '@mui/icons-material/VisibilityOff';

/** Calendário do seletor de data. O locale vem do `DateLocalizationProvider`. */
export { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
