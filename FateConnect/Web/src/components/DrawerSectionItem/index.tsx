import { useCallback } from 'react';

import { ListItemButton, ListItemText } from '@design-system';

import type { LandingSectionEnum } from '@app/routes/paths';

type DrawerSectionItemProps = Readonly<{
  section: LandingSectionEnum;
  label: string;
  onSelect: (section: LandingSectionEnum) => void;
}>;

/** Item do menu lateral que rola até uma seção da landing. */
export function DrawerSectionItem({ section, label, onSelect }: DrawerSectionItemProps) {
  const handleClick = useCallback(() => onSelect(section), [onSelect, section]);

  return (
    <ListItemButton onClick={handleClick}>
      <ListItemText primary={label} />
    </ListItemButton>
  );
}
