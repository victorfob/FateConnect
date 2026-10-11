import { useCallback } from 'react';
import { useSearchParams } from 'react-router';
import { Button, CircularProgress, PageMessage } from '@design-system';
import { skipToken, useQuery } from '@tanstack/react-query';

import { unlockAccount } from '@app/services/auth/authService';

import { SignInButton } from './components/SignInButton';
import { isExpiredLink } from './helpers';
import * as C from './constants';

const UNLOCKED = true;

function unlockQueryFunction(token: string | null) {
  if (token === null) return skipToken;

  return async () => {
    await unlockAccount(token);

    return UNLOCKED;
  };
}

export function UnlockAccount() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get(C.TOKEN_PARAM);
  const email = searchParams.get(C.EMAIL_PARAM) ?? '';

  // Consulta, e não mutação: o StrictMode monta a tela duas vezes e o link só vale
  // uma, e a consulta com a mesma chave chega à API uma vez só.
  const { isSuccess, isFetching, error, refetch } = useQuery({
    queryKey: [C.UNLOCK_QUERY_KEY, token],
    queryFn: unlockQueryFunction(token),
    retry: false,
    staleTime: Infinity,
    meta: { notifiesErrorItself: true },
  });

  const handleRetry = useCallback(() => void refetch(), [refetch]);

  if (token === null || isExpiredLink(error))
    return (
      <PageMessage
        title={C.EXPIRED_LINK_MESSAGE.title}
        description={C.EXPIRED_LINK_MESSAGE.description}
      >
        <SignInButton email={email} />
      </PageMessage>
    );

  if (isSuccess)
    return (
      <PageMessage title={C.UNLOCKED_MESSAGE.title} description={C.UNLOCKED_MESSAGE.description}>
        <SignInButton email={email} />
      </PageMessage>
    );

  if (error)
    return (
      <PageMessage
        title={C.UNLOCK_FAILED_MESSAGE.title}
        description={C.UNLOCK_FAILED_MESSAGE.description}
      >
        <Button variant="contained" color="secondary" loading={isFetching} onClick={handleRetry}>
          {C.RETRY_LABEL}
        </Button>
      </PageMessage>
    );

  return (
    <PageMessage title={C.LOADING_TITLE}>
      <CircularProgress aria-label={C.LOADING_TITLE} />
    </PageMessage>
  );
}
