import { Navigate, Outlet } from 'react-router';

import { RoutePathEnum } from '@app/routes/paths';
import { loggedUserIsAdministrator } from '@app/services/auth/loggedUser';

/**
 * ⛔ Conveniência, não segurança: o token é editável por quem o guarda, e quem
 * barra de verdade é a API. Ele existe para não oferecer uma tela que a pessoa
 * não pode operar.
 */
export function AdminRoute() {
  if (!loggedUserIsAdministrator()) return <Navigate to={RoutePathEnum.MENU} replace />;

  return <Outlet />;
}
