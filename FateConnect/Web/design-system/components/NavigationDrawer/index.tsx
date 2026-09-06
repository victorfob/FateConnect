import type { ReactNode } from 'react';

import * as S from './styles';

export type NavigationDrawerProps = Readonly<{
  open: boolean;
  onClose: VoidFunction;
  header: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}>;

export function NavigationDrawer({
  open,
  onClose,
  header,
  children,
  footer,
}: NavigationDrawerProps) {
  return (
    <S.DrawerRoot anchor="right" open={open} onClose={onClose}>
      <S.DrawerHeader>{header}</S.DrawerHeader>
      <S.DrawerList>{children}</S.DrawerList>
      {footer && <S.DrawerFooter>{footer}</S.DrawerFooter>}
    </S.DrawerRoot>
  );
}
