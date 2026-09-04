import { DirectionsCarIcon, SearchIcon, SecurityIcon } from '@design-system/icons';

import { RoutePathEnum } from '@app/routes/paths';

import type { MenuService } from '../@types';

export const MENU_TITLE = 'Boas-vindas ao FateConnect';
export const MENU_INTRO = 'Escolha um dos serviços abaixo para começar.';

/** A ordem é a do produto, não alfabética. */
export const MENU_SERVICES: MenuService[] = [
  { label: 'Achados & Perdidos', path: RoutePathEnum.LOST_AND_FOUND, Icon: SearchIcon },
  { label: 'Caronas', path: RoutePathEnum.RIDES, Icon: DirectionsCarIcon },
  { label: 'Denúncias', path: RoutePathEnum.DENUNCIATIONS, Icon: SecurityIcon },
];
