import {
  AdminPanelSettingsIcon,
  DirectionsCarIcon,
  NotificationsIcon,
  SearchIcon,
  SecurityIcon,
  type SvgIconComponent,
} from '@design-system/icons';

import { LandingSectionEnum, RoutePathEnum } from '@app/routes/paths';

export type LandingLink = { section: LandingSectionEnum; label: string; highlighted: boolean };
export type AppLink = { path: RoutePathEnum; label: string; Icon: SvgIconComponent };

export const LANDING_LINKS: LandingLink[] = [
  { section: LandingSectionEnum.SERVICES, label: 'Serviços', highlighted: false },
  { section: LandingSectionEnum.HOW_IT_WORKS, label: 'Como funciona', highlighted: false },
  { section: LandingSectionEnum.CONTACT, label: 'Entre em contato', highlighted: false },
  { section: LandingSectionEnum.LOGIN, label: 'Entrar', highlighted: true },
];

/**
 * Navegação da área logada. Sem "Entre em Contato": a tela de contato existe
 * como âncora na landing, não como rota de quem já entrou.
 */
export const APP_LINKS: AppLink[] = [
  { path: RoutePathEnum.LOST_AND_FOUND, label: 'Achados & Perdidos', Icon: SearchIcon },
  { path: RoutePathEnum.RIDES, label: 'Caronas', Icon: DirectionsCarIcon },
  { path: RoutePathEnum.DENUNCIATIONS, label: 'Denúncias', Icon: SecurityIcon },
];

/** Fora de `APP_LINKS` porque só quem é administrador o enxerga. */
export const MANAGEMENT_LINK: AppLink = {
  path: RoutePathEnum.MANAGEMENT,
  label: 'Gestão',
  Icon: AdminPanelSettingsIcon,
};

/** Fora de `APP_LINKS` porque essa lista também desenha a navegação do topo. */
export const NOTIFICATIONS_LINK: AppLink = {
  path: RoutePathEnum.NOTIFICATIONS,
  label: 'Notificações',
  Icon: NotificationsIcon,
};
