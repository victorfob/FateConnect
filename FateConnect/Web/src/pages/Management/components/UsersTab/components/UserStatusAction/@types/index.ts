import type { SvgIconComponent } from '@design-system/icons';

import type { AccountStatusEnum } from '@app/services/users/types';

export type StatusAction = Readonly<{
  target: AccountStatusEnum;
  label: string;
  Icon: SvgIconComponent;
  dialogTitle: string;
  messagePrefix: string;
  messageSuffix: string;
}>;
