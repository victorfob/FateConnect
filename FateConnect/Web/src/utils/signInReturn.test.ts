import { RoutePathEnum } from '@app/routes/paths';

import { afterSignInPath, signInReturnState } from './signInReturn';

describe('signInReturn', () => {
  it('should return to the path the state carries', () => {
    const path = '/notificacoes/abrir?aviso=7&tipo=denuncias';

    expect(afterSignInPath(signInReturnState(path))).toBe(path);
  });

  it('should fall back to the menu without a path of this app', () => {
    expect(afterSignInPath(null)).toBe(RoutePathEnum.MENU);
    expect(afterSignInPath({ email: 'maria@fatec.sp.gov.br' })).toBe(RoutePathEnum.MENU);
    expect(afterSignInPath(signInReturnState('https://exemplo.test/'))).toBe(RoutePathEnum.MENU);
    expect(afterSignInPath(signInReturnState('//exemplo.test/'))).toBe(RoutePathEnum.MENU);
  });
});
