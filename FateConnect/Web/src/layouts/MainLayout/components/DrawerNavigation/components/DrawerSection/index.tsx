import { useId } from 'react';
import { Link as RouterLink, useLocation } from 'react-router';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
} from '@design-system';

import type { AppLink } from '@app/constants/navigation';

type DrawerSectionProps = Readonly<{
  label: string;
  links: AppLink[];
  onNavigate: VoidFunction;
}>;

export function DrawerSection({ label, links, onNavigate }: DrawerSectionProps) {
  const labelId = useId();
  const { pathname } = useLocation();

  return (
    <Box component="li">
      <ListSubheader component="h2" id={labelId} disableSticky>
        {label}
      </ListSubheader>

      <List aria-labelledby={labelId} disablePadding>
        {links.map(({ path, label, Icon }) => (
          <ListItem key={path} disablePadding>
            <ListItemButton
              component={RouterLink}
              to={path}
              onClick={onNavigate}
              aria-current={path === pathname ? 'page' : undefined}
            >
              <ListItemIcon>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
