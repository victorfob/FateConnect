import { useCallback, useMemo } from 'react';

import { ConfirmAction } from '@app/components/ConfirmAction';
import type { UserSummary } from '@app/services/users/managementTypes';
import { AccountStatusEnum } from '@app/services/users/types';

import * as C from './constants';

type UserStatusActionProps = Readonly<{
  user: UserSummary;
  onConfirm: (user: UserSummary, status: AccountStatusEnum) => void;
}>;

/** A API bane de qualquer situação e só reativa quem foi banido. */
export function UserStatusAction({ user, onConfirm }: UserStatusActionProps) {
  const action = useMemo(() => {
    if (user.status === AccountStatusEnum.BANNED) return C.REVERT_BAN_ACTION;

    return C.BAN_ACTION;
  }, [user.status]);

  const handleConfirm = useCallback(
    () => onConfirm(user, action.target),
    [onConfirm, user, action],
  );

  return (
    <ConfirmAction.Row>
      <ConfirmAction
        label={action.label}
        icon={<action.Icon fontSize="small" />}
        dialogTitle={action.dialogTitle}
        messagePrefix={action.messagePrefix}
        messageSuffix={action.messageSuffix}
        subject={user.fullName}
        confirmLabel={C.CONFIRM_LABEL}
        onConfirm={handleConfirm}
      />
    </ConfirmAction.Row>
  );
}
