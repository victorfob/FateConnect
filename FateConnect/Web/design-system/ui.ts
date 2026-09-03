/**
 * Componentes de UI expostos pelo design system.
 *
 * A aplicação importa daqui, nunca de `@mui/material` — é o que permite
 * envolver, substituir ou restringir um componente sem varrer o app inteiro.
 */
export { default as Accordion } from '@mui/material/Accordion';
export { default as AccordionDetails } from '@mui/material/AccordionDetails';
export { default as AccordionSummary } from '@mui/material/AccordionSummary';
export { default as AppBar } from '@mui/material/AppBar';
export { default as Box } from '@mui/material/Box';
export { default as Button } from '@mui/material/Button';
export { default as Checkbox } from '@mui/material/Checkbox';
export { default as CircularProgress } from '@mui/material/CircularProgress';
export { default as Divider } from '@mui/material/Divider';
export { default as Drawer } from '@mui/material/Drawer';
export { default as FormControlLabel } from '@mui/material/FormControlLabel';
export { default as List } from '@mui/material/List';
export { default as ListItemButton } from '@mui/material/ListItemButton';
export { default as ListItemIcon } from '@mui/material/ListItemIcon';
export { default as ListItemText } from '@mui/material/ListItemText';
export { default as ListSubheader } from '@mui/material/ListSubheader';
export { default as Popover } from '@mui/material/Popover';
export { default as Stack } from '@mui/material/Stack';
export { default as Toolbar } from '@mui/material/Toolbar';
export { default as Typography } from '@mui/material/Typography';

export type { BoxProps } from '@mui/material/Box';
export type { ButtonProps } from '@mui/material/Button';
export type { TypographyProps } from '@mui/material/Typography';

/** Calendário avulso; o do campo de data mora dentro do `Input`. */
export { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
