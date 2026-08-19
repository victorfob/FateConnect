import { Outlet } from 'react-router';

import { ShellContent, ShellRoot } from '../shell.styles';

/** Casca das rotas públicas (`/inicio`, `/cadastro`). Header, rodapé e menu lateral chegam na #51. */
export function GuestLayout() {
  return (
    <ShellRoot>
      <ShellContent>
        <Outlet />
      </ShellContent>
    </ShellRoot>
  );
}
