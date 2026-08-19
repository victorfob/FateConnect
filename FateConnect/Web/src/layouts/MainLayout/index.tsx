import { Outlet } from 'react-router';

import { ShellContent, ShellRoot } from '../shell.styles';

/** Casca das rotas internas (`/menu`, `/caronas`, …). Header, rodapé e menu lateral chegam na #51. */
export function MainLayout() {
  return (
    <ShellRoot>
      <ShellContent>
        <Outlet />
      </ShellContent>
    </ShellRoot>
  );
}
