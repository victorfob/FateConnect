import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { Button, CircularProgress, PageMessage } from '@design-system';
import { skipToken, useQuery } from '@tanstack/react-query';

import { SignInButton } from '@app/components/SignInButton';
import {
  EMAIL_LINK_EMAIL_PARAM,
  EMAIL_LINK_TOKEN_PARAM,
  isExpiredLink,
} from '@app/utils/emailLink';

import { unlockQueryFunction } from './helpers';
import * as C from './constants';

export function UnlockAccount() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get(EMAIL_LINK_TOKEN_PARAM);
  const email = searchParams.get(EMAIL_LINK_EMAIL_PARAM) ?? '';

  const queryFn = useMemo(() => {
    if (token === null) return skipToken;

    return unlockQueryFunction(token);
  }, [token]);

  // Consulta, e não mutação: o StrictMode monta a tela duas vezes e o link só vale
  // uma, e a consulta com a mesma chave chega à API uma vez só.
  const { isSuccess, isFetching, error, refetch } = useQuery({
    queryKey: [C.UNLOCK_QUERY_KEY, token],
    queryFn,
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
        tone="info"
      >
        <SignInButton email={email} />
      </PageMessage>
    );

  if (isSuccess)
    return (
      <PageMessage
        title={C.UNLOCKED_MESSAGE.title}
        description={C.UNLOCKED_MESSAGE.description}
        tone="success"
      >
        <SignInButton email={email} />
      </PageMessage>
    );

  if (error)
    return (
      <PageMessage
        title={C.UNLOCK_FAILED_MESSAGE.title}
        description={C.UNLOCK_FAILED_MESSAGE.description}
        tone="error"
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
