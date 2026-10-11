import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Button, CircularProgress, PageMessage } from '@design-system';
import { skipToken, useQuery } from '@tanstack/react-query';

import {
  EMAIL_LINK_EMAIL_PARAM,
  EMAIL_LINK_TOKEN_PARAM,
  isExpiredLink,
} from '@app/utils/emailLink';

import { NewPasswordForm } from './components/NewPasswordForm';
import { ResetLinkExpiredMessage } from './components/ResetLinkExpiredMessage';
import { verifyQueryFunction } from './helpers';
import * as C from './constants';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get(EMAIL_LINK_TOKEN_PARAM);
  const email = searchParams.get(EMAIL_LINK_EMAIL_PARAM) ?? '';
  // O link vale ao abrir e pode vencer até a senha nova ser salva.
  const [expiredOnSave, setExpiredOnSave] = useState(false);

  const queryFn = useMemo(() => {
    if (token === null) return skipToken;

    return verifyQueryFunction(token);
  }, [token]);

  const { isSuccess, isFetching, error, refetch } = useQuery({
    queryKey: [C.VERIFY_RESET_TOKEN_QUERY_KEY, token],
    queryFn,
    retry: false,
    staleTime: Infinity,
    meta: { notifiesErrorItself: true },
  });

  const handleRetry = useCallback(() => void refetch(), [refetch]);
  const handleLinkExpired = useCallback(() => setExpiredOnSave(true), []);

  if (token === null || expiredOnSave || isExpiredLink(error))
    return <ResetLinkExpiredMessage email={email} />;

  if (isSuccess)
    return <NewPasswordForm token={token} email={email} onLinkExpired={handleLinkExpired} />;

  if (error)
    return (
      <PageMessage
        title={C.VERIFY_FAILED_MESSAGE.title}
        description={C.VERIFY_FAILED_MESSAGE.description}
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
