import { useCallback } from 'react';
import { PersonOffIcon } from '@design-system/icons';
import { useMutation } from '@tanstack/react-query';

import { ConfirmAction } from '@app/components/ConfirmAction';
import { useNotification } from '@app/hooks/useNotification';
import { deactivateAccount } from '@app/services/users/profileService';

import * as C from './constants';
import * as S from './styles';

/** Desativar derruba a sessão, e quem leva a pessoa para fora é o guard da rota. */
export function DeactivateAccount() {
  const { notifySuccess } = useNotification();
  const { mutate } = useMutation({
    mutationFn: deactivateAccount,
    meta: { errorMessage: C.DEACTIVATE.failed },
    onSuccess: () => notifySuccess(C.DEACTIVATE.succeeded),
  });

  const handleDeactivate = useCallback(() => mutate(), [mutate]);

  return (
    <S.DeactivateRow>
      <ConfirmAction
        label={C.DEACTIVATE.label}
        icon={<PersonOffIcon fontSize="small" />}
        dialogTitle={C.DEACTIVATE.dialogTitle}
        messagePrefix={C.DEACTIVATE.messagePrefix}
        subject={C.DEACTIVATE.subject}
        messageSuffix={C.DEACTIVATE.messageSuffix}
        confirmLabel={C.DEACTIVATE.confirmLabel}
        onConfirm={handleDeactivate}
        destructive
      />
    </S.DeactivateRow>
  );
}
