import { useCallback, useMemo } from 'react';
import { Navigate, useSearchParams } from 'react-router';
import { Button, CircularProgress, PageMessage } from '@design-system';
import { skipToken, useQuery } from '@tanstack/react-query';

import { ResendConfirmationButton } from '@app/components/ResendConfirmationButton';
import { SignInButton } from '@app/components/SignInButton';
import { BANNED_ACCOUNT_MESSAGE } from '@app/constants/bannedAccount';
import { useCountdown } from '@app/hooks/useCountdown';
import { useNotification } from '@app/hooks/useNotification';
import { RoutePathEnum } from '@app/routes/paths';
import {
  EMAIL_LINK_EMAIL_PARAM,
  EMAIL_LINK_TOKEN_PARAM,
  isExpiredLink,
} from '@app/utils/emailLink';

import { confirmQueryFunction, isBannedAccount } from './helpers';
import * as C from './constants';

export function ConfirmEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get(EMAIL_LINK_TOKEN_PARAM);
  const email = searchParams.get(EMAIL_LINK_EMAIL_PARAM) ?? '';
  const { notifySuccess } = useNotification();
  const resendCountdown = useCountdown();

  // O aviso sai antes da troca de tela: guardada a sessão, a rota de visitante
  // desmonta esta tela sozinha.
  const handleConfirmed = useCallback(() => notifySuccess(C.CONFIRMED_MESSAGE), [notifySuccess]);

  const queryFn = useMemo(() => {
    if (token === null) return skipToken;

    return confirmQueryFunction(token, handleConfirmed);
  }, [token, handleConfirmed]);

  // Consulta, e não mutação: o StrictMode monta a tela duas vezes e o link só vale
  // uma, e a consulta com a mesma chave chega à API uma vez só.
  const { isSuccess, isFetching, error, refetch } = useQuery({
    queryKey: [C.CONFIRM_EMAIL_QUERY_KEY, token],
    queryFn,
    retry: false,
    staleTime: Infinity,
    meta: { notifiesErrorItself: true },
  });

  const handleRetry = useCallback(() => void refetch(), [refetch]);

  if (isSuccess) return <Navigate to={RoutePathEnum.MENU} replace />;

  if (token === null || isExpiredLink(error))
    return (
      <PageMessage
        title={C.EXPIRED_LINK_MESSAGE.title}
        description={C.EXPIRED_LINK_MESSAGE.description}
        tone="warning"
      >
        <SignInButton email={email} variant="soft" />
        {email && <ResendConfirmationButton email={email} countdown={resendCountdown} />}
      </PageMessage>
    );

  if (isBannedAccount(error))
    return (
      <PageMessage
        title={C.BANNED_ACCOUNT_TITLE}
        description={BANNED_ACCOUNT_MESSAGE}
        tone="error"
      />
    );

  if (error)
    return (
      <PageMessage
        title={C.CONFIRMATION_FAILED_MESSAGE.title}
        description={C.CONFIRMATION_FAILED_MESSAGE.description}
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
