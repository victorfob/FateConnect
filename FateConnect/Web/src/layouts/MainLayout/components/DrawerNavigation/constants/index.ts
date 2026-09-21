import { PersonIcon, SettingsIcon } from '@design-system/icons';

import type { AppLink } from '@app/constants/navigation';
import { RoutePathEnum } from '@app/routes/paths';

export const SERVICES_LABEL = 'Serviços';
export const ACCOUNT_LABEL = 'Conta';

export const ACCOUNT_LINKS: AppLink[] = [
  { path: RoutePathEnum.PROFILE, label: 'Meu perfil', Icon: PersonIcon },
  { path: RoutePathEnum.PREFERENCES, label: 'Preferências', Icon: SettingsIcon },
];
