import type { ReactNode } from 'react';

import * as S from './styles';

type NavigationDrawerProps = Readonly<{
  open: boolean;
  onClose: VoidFunction;
  header: ReactNode;
  children: ReactNode;
}>;

/** Menu lateral. Quem usa monta o cabeçalho e os itens. */
export function NavigationDrawer({ open, onClose, header, children }: NavigationDrawerProps) {
  return (
    <S.DrawerRoot anchor="right" open={open} onClose={onClose}>
      <S.DrawerHeader>{header}</S.DrawerHeader>
      <S.DrawerList>{children}</S.DrawerList>
    </S.DrawerRoot>
  );
}
