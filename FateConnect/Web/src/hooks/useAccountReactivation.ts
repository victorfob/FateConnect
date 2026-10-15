import { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useMutation } from '@tanstack/react-query';

import { REACTIVATION_SUCCEEDED } from '@app/components/AccountReactivationDialog/constants';
import { useNotification } from '@app/hooks/useNotification';
import { reactivate } from '@app/services/auth/authService';
import type { LoginRequest } from '@app/services/auth/types';
import type { ApiError } from '@app/services/httpClient';
import { afterSignInPath } from '@app/utils/signInReturn';

type AccountReactivation = Readonly<{
  asking: boolean;
  reactivating: boolean;
  askToReactivate: (credentials: LoginRequest) => void;
  dismiss: VoidFunction;
  confirm: VoidFunction;
}>;

export function useAccountReactivation(
  onRefused: (error: ApiError, credentials: LoginRequest) => void,
): AccountReactivation {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { notifySuccess } = useNotification();
  const [credentials, setCredentials] = useState<LoginRequest | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: reactivate,
    meta: { notifiesErrorItself: true },
    onSuccess: () => {
      notifySuccess(REACTIVATION_SUCCEEDED);
      void navigate(afterSignInPath(state), { replace: true });
    },
    onError: (error: ApiError, refused) => {
      setCredentials(null);
      onRefused(error, refused);
    },
  });

  const dismiss = useCallback(() => setCredentials(null), []);

  const confirm = useCallback(() => {
    if (credentials) mutate(credentials);
  }, [credentials, mutate]);

  return {
    asking: credentials !== null,
    reactivating: isPending,
    askToReactivate: setCredentials,
    dismiss,
    confirm,
  };
}
