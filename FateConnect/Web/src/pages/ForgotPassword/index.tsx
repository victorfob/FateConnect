import { useCallback, useState } from 'react';
import { useLocation } from 'react-router';
import { Input } from '@design-system';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

import { AuthCard } from '@app/components/AuthCard';
import { SignupPrompt } from '@app/components/SignupPrompt';
import { useNotification } from '@app/hooks/useNotification';
import { forgotPassword } from '@app/services/auth/authService';
import type { ApiError } from '@app/services/httpClient';
import { prefilledEmailOf } from '@app/utils/loginPrefill';

import { ResetLinkSentMessage } from './components/ResetLinkSentMessage';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from './schema';
import * as C from './constants';

const NOT_FOUND = 404;

export function ForgotPassword() {
  const { state } = useLocation();
  const { notifyError } = useNotification();
  const [linkSentTo, setLinkSentTo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: prefilledEmailOf(state) ?? '' },
  });

  const handleRefusal = useCallback(
    (error: ApiError) => {
      if (error.status === NOT_FOUND) {
        setError('email', { message: C.NO_ACCOUNT_MESSAGE }, { shouldFocus: true });
        return;
      }

      notifyError(C.REQUEST_FAILED_MESSAGE);
    },
    [notifyError, setError],
  );

  const { mutate, isPending } = useMutation({
    mutationFn: forgotPassword,
    // O 404 vira erro no campo; o aviso sai daqui, não do tratamento global.
    meta: { notifiesErrorItself: true },
    onSuccess: (_answer, email) => setLinkSentTo(email),
    onError: handleRefusal,
  });

  const onSubmit = handleSubmit(({ email }) => mutate(email));

  if (linkSentTo) return <ResetLinkSentMessage email={linkSentTo} />;

  return (
    <AuthCard.Page>
      <AuthCard title={C.FORGOT_PASSWORD_TITLE} description={C.FORGOT_PASSWORD_INTRO}>
        <AuthCard.Form component="form" onSubmit={onSubmit} noValidate>
          <Input
            {...register('email')}
            label={C.EMAIL_LABEL}
            required
            type="email"
            autoComplete="username"
            error={errors.email?.message}
          />

          <AuthCard.Submit loading={isPending}>{C.SUBMIT_LABEL}</AuthCard.Submit>
        </AuthCard.Form>

        <SignupPrompt />
      </AuthCard>
    </AuthCard.Page>
  );
}
