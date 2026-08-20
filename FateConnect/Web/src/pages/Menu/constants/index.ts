import { RoutePathEnum } from '@app/routes/paths';
import { DirectionsCarIcon, SearchIcon } from '@design-system/icons';

import type { MenuService } from '../@types';

export const MENU_TITLE = 'Bem-vindo ao FateConnect';
export const MENU_INTRO = 'Escolha um dos serviços abaixo para começar.';

/** Mesma ordem do produto: achados e perdidos antes de caronas. */
export const MENU_SERVICES: MenuService[] = [
  { label: 'Achados & Perdidos', path: RoutePathEnum.LOST_AND_FOUND, Icon: SearchIcon },
  { label: 'Caronas', path: RoutePathEnum.RIDES, Icon: DirectionsCarIcon },
];
