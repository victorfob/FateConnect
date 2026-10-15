import { RoutePathEnum } from '@app/routes/paths';

type SignInReturnState = Readonly<{ returnTo: string }>;

const APP_PATH_START = '/';
const OTHER_ORIGIN_START = '//';

/** O caminho viaja no estado da navegação, e não na URL: ninguém monta um link que leva para fora. */
export function signInReturnState(path: string): SignInReturnState {
  return { returnTo: path };
}

export function afterSignInPath(state: unknown): string {
  if (typeof state !== 'object' || state === null) return RoutePathEnum.MENU;

  const returnTo: unknown = Reflect.get(state, 'returnTo');
  if (typeof returnTo !== 'string') return RoutePathEnum.MENU;
  if (!returnTo.startsWith(APP_PATH_START) || returnTo.startsWith(OTHER_ORIGIN_START))
    return RoutePathEnum.MENU;

  return returnTo;
}
