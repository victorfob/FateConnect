import type { ReactNode } from 'react';

import { DrawerHeader, DrawerList, DrawerRoot } from './styles';

type NavigationDrawerProps = {
  open: boolean;
  onClose: VoidFunction;
  header: ReactNode;
  children: ReactNode;
};

/** Menu lateral. Quem usa monta o cabeçalho e os itens. */
export function NavigationDrawer({ open, onClose, header, children }: NavigationDrawerProps) {
  return (
    <DrawerRoot anchor="right" open={open} onClose={onClose}>
      <DrawerHeader>{header}</DrawerHeader>
      <DrawerList>{children}</DrawerList>
    </DrawerRoot>
  );
}
