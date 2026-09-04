import { NotificationsIcon, PersonIcon, SettingsIcon } from '@design-system/icons';

import { APP_LINKS, type AppLink } from '@app/constants/navigation';
import { RoutePathEnum } from '@app/routes/paths';

export const SERVICES_LABEL = 'Serviços';
export const ACCOUNT_LABEL = 'Conta';

/** `Notificações` fica fora de `APP_LINKS` porque essa lista também desenha a navegação do topo. */
export const SERVICE_LINKS: AppLink[] = [
  ...APP_LINKS,
  { path: RoutePathEnum.NOTIFICATIONS, label: 'Notificações', Icon: NotificationsIcon },
];

export const ACCOUNT_LINKS: AppLink[] = [
  { path: RoutePathEnum.PROFILE, label: 'Meu perfil', Icon: PersonIcon },
  { path: RoutePathEnum.PREFERENCES, label: 'Preferências', Icon: SettingsIcon },
];
