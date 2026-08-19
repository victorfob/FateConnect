import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { useCallback } from 'react';

import type { LandingSection } from '@app/routes/paths';

type DrawerSectionItemProps = {
  section: LandingSection;
  label: string;
  onSelect: (section: LandingSection) => void;
};

/** Item do menu lateral que rola até uma seção da landing. */
export function DrawerSectionItem({ section, label, onSelect }: DrawerSectionItemProps) {
  const handleClick = useCallback(() => onSelect(section), [onSelect, section]);

  return (
    <ListItemButton onClick={handleClick}>
      <ListItemText primary={label} />
    </ListItemButton>
  );
}
