import { useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';

import { PUSH_TEXTS } from '@app/constants/push';
import { subscribeThisDevice } from '@app/services/inAppNotifications/pushDevice';

/** Inscreve o aparelho depois de a pessoa dar a permissão, no aviso ou no interruptor. */
export function usePushSubscription(): VoidFunction {
  const { mutate } = useMutation({
    mutationFn: subscribeThisDevice,
    meta: { errorMessage: PUSH_TEXTS.activationFailed },
  });

  // Sem repassar argumento: ligado direto a um clique, o evento viraria a variável da mutação.
  return useCallback(() => mutate(), [mutate]);
}
