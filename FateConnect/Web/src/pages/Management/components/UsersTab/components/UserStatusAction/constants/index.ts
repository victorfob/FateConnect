import { BlockIcon, RestoreIcon } from '@design-system/icons';

import { AccountStatusEnum } from '@app/services/users/types';

import type { StatusAction } from '../@types';

export const CONFIRM_LABEL = 'Confirmar';

export const BAN_ACTION: StatusAction = {
  target: AccountStatusEnum.BANNED,
  label: 'Banir',
  Icon: BlockIcon,
  dialogTitle: 'Banir conta',
  messagePrefix: 'Tem certeza que deseja banir ',
  messageSuffix: '? A pessoa deixa de entrar no FateConnect, e a sessão aberta é encerrada.',
};

export const REVERT_BAN_ACTION: StatusAction = {
  target: AccountStatusEnum.ACTIVE,
  label: 'Reverter banimento',
  Icon: RestoreIcon,
  dialogTitle: 'Reverter banimento',
  messagePrefix: 'Tem certeza que deseja reverter o banimento de ',
  messageSuffix: '? A pessoa volta a entrar no FateConnect.',
};
