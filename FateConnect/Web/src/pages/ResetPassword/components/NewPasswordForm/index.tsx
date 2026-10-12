import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Input } from '@design-system';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

import { AccountReactivationDialog } from '@app/components/AccountReactivationDialog';
import { AccountUsername } from '@app/components/AccountUsername';
import { AuthCard } from '@app/components/AuthCard';
import { BANNED_ACCOUNT_MESSAGE } from '@app/constants/bannedAccount';
import { useAccountReactivation } from '@app/hooks/useAccountReactivation';
import { useNotification } from '@app/hooks/useNotification';
import { RoutePathEnum } from '@app/routes/paths';
import { resetPassword } from '@app/services/auth/authService';
import type { ApiError } from '@app/services/httpClient';
import { isExpiredLink } from '@app/utils/emailLink';

import { newPasswordSchema, type NewPasswordFormValues } from '../../schema';
import * as C from './constants';

const FORBIDDEN = 403;
const CONFLICT = 409;

type NewPasswordFormProps = Readonly<{ token: string; email: string; onLinkExpired: VoidFunction }>;

export function NewPasswordForm({ token, email, onLinkExpired }: NewPasswordFormProps) {
  const navigate = useNavigate();
  const { notifySuccess, notifyError } = useNotification();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewPasswordFormValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { newPassword: '', passwordConfirmation: '' },
  });

  const handleReactivationRefusal = useCallback(
    (error: ApiError) => {
      if (error.status === FORBIDDEN) {
        notifyError(BANNED_ACCOUNT_MESSAGE);
        return;
      }

      notifyError(C.RESET_FAILED_MESSAGE);
    },
    [notifyError],
  );

  const reactivation = useAccountReactivation(handleReactivationRefusal);

  const { mutate, isPending } = useMutation({
    mutationFn: resetPassword,
    meta: { notifiesErrorItself: true },
    onSuccess: () => {
      notifySuccess(C.PASSWORD_CHANGED_MESSAGE);
      void navigate(RoutePathEnum.MENU);
    },
    onError: (error: ApiError, { newPassword }) => {
      // A senha já foi trocada: falta só reativar, com ela.
      if (error.status === CONFLICT) {
        reactivation.askToReactivate({ fatecEmail: email, password: newPassword });
        return;
      }

      if (isExpiredLink(error)) {
        onLinkExpired();
        return;
      }

      handleReactivationRefusal(error);
    },
  });

  const onSubmit = handleSubmit(({ newPassword }) => mutate({ token, newPassword }));

  return (
    <AuthCard.Page>
      <AuthCard title={C.NEW_PASSWORD_TITLE}>
        <AuthCard.Form component="form" onSubmit={onSubmit} noValidate>
          <AccountUsername email={email} />

          <Input.Password
            {...register('newPassword')}
            purpose="new"
            label={C.NEW_PASSWORD_LABEL}
            required
            error={errors.newPassword?.message}
          />

          <Input.Password
            {...register('passwordConfirmation')}
            purpose="new"
            label={C.PASSWORD_CONFIRMATION_LABEL}
            required
            error={errors.passwordConfirmation?.message}
          />

          <AuthCard.Submit loading={isPending}>{C.SUBMIT_LABEL}</AuthCard.Submit>
        </AuthCard.Form>

        <AccountReactivationDialog
          open={reactivation.asking}
          reactivating={reactivation.reactivating}
          onDismiss={reactivation.dismiss}
          onConfirm={reactivation.confirm}
        />
      </AuthCard>
    </AuthCard.Page>
  );
}
