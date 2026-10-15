import { useCallback } from 'react';
import { PersonOffIcon, PersonOffOutlinedIcon } from '@design-system/icons';
import { useMutation } from '@tanstack/react-query';

import { ConfirmAction, type ConfirmActionProps } from '@app/components/ConfirmAction';
import { useNotification } from '@app/hooks/useNotification';
import { deactivateAccount } from '@app/services/users/profileService';

import * as C from './constants';

export type DeactivateAccountProps = Readonly<
  Partial<Pick<ConfirmActionProps, 'asLink' | 'label'>>
>;

/** Desativar derruba a sessão, e quem leva a pessoa para fora é o guard da rota. */
export function DeactivateAccount({ asLink, label = C.DEACTIVATE.label }: DeactivateAccountProps) {
  const { notifySuccess } = useNotification();
  const { mutate } = useMutation({
    mutationFn: deactivateAccount,
    meta: { errorMessage: C.DEACTIVATE.failed },
    onSuccess: () => notifySuccess(C.DEACTIVATE.succeeded),
  });

  const handleDeactivate = useCallback(() => mutate(), [mutate]);

  return (
    <ConfirmAction
      label={label}
      icon={<PersonOffIcon fontSize="small" />}
      dialogTitle={C.DEACTIVATE.dialogTitle}
      messagePrefix={C.DEACTIVATE.messagePrefix}
      subject={C.DEACTIVATE.subject}
      messageSuffix={C.DEACTIVATE.messageSuffix}
      confirmLabel={C.DEACTIVATE.confirmLabel}
      onConfirm={handleDeactivate}
      destructive
      dialogIcon={PersonOffOutlinedIcon}
      asLink={asLink}
    />
  );
}
