import type { ReactNode } from 'react';

import { DrawerHeader, DrawerList, DrawerRoot } from './styles';

type NavigationDrawerProps = {
  open: boolean;
  onClose: VoidFunction;
  header: ReactNode;
  children: ReactNode;
};

/** Menu lateral das duas cascas. Cada layout monta os próprios itens. */
export function NavigationDrawer({ open, onClose, header, children }: NavigationDrawerProps) {
  return (
    <DrawerRoot anchor="right" open={open} onClose={onClose}>
      <DrawerHeader>{header}</DrawerHeader>
      <DrawerList>{children}</DrawerList>
    </DrawerRoot>
  );
}
