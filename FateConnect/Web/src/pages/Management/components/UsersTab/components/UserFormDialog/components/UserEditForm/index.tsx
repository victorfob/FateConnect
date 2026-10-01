import { useCallback } from 'react';
import { Dialog, Input } from '@design-system';
import { SaveIcon } from '@design-system/icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';

import {
  CONTACT_FIELD_LABELS,
  MAX_CONTACT_EMAIL_LENGTH,
} from '@app/components/ContactFields/constants';
import { useMaskedField } from '@app/hooks/useMaskedField';
import { useNotification } from '@app/hooks/useNotification';
import * as C from '@app/pages/Management/components/UsersTab/components/UserFormDialog/constants';
import {
  toFormValues,
  toUserUpdateInput,
} from '@app/pages/Management/components/UsersTab/components/UserFormDialog/helpers/mapper';
import {
  userFormSchema,
  type UserFormValues,
} from '@app/pages/Management/components/UsersTab/components/UserFormDialog/schema';
import { USERS_QUERY_KEY } from '@app/pages/Management/components/UsersTab/constants';
import { PROFILE_TYPE_OPTIONS } from '@app/pages/Management/components/UsersTab/helpers/profileType';
import { FIELD_LABELS } from '@app/pages/Signup/constants';
import { conflictFieldOf } from '@app/pages/Signup/helpers/conflictField';
import { MAX_LENGTH } from '@app/pages/Signup/schema';
import { ApiError, SessionExpiredError } from '@app/services/httpClient';
import type { User } from '@app/services/users/types';
import { changeUserProfile, updateUser } from '@app/services/users/usersService';
import { hasContact } from '@app/utils/contact';
import { maskPhone } from '@app/utils/masks/phoneMask';

const BAD_REQUEST = 400;

function errorMessageFor(status?: number): string {
  if (status === BAD_REQUEST) return C.USER_FORM_MESSAGES.invalidData;

  return C.USER_FORM_MESSAGES.failed;
}

type UserEditFormProps = Readonly<{
  user: User;
  /** A API recusa rebaixar a própria conta, então o campo de perfil nem aparece. */
  isOwnAccount: boolean;
  onClose: VoidFunction;
}>;

export function UserEditForm({ user, isOwnAccount, onClose }: UserEditFormProps) {
  const queryClient = useQueryClient();
  const { notifySuccess, notifyError } = useNotification();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (values: UserFormValues) => {
      const updated = await updateUser(user.id, toUserUpdateInput(values));
      if (values.profileType === user.profileType) return updated;

      return changeUserProfile(user.id, values.profileType);
    },
    // O conflito aponta o campo, e aí o aviso sai no próprio campo.
    meta: { notifiesErrorItself: true },
    onSuccess: async (updated) => {
      notifySuccess(C.USER_FORM_MESSAGES.updated);
      onClose();
      queryClient.setQueryData([C.USER_QUERY_KEY, updated.id], updated);
      await queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
  });

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: toFormValues(user),
    disabled: isPending,
  });
  const {
    control,
    register,
    setError,
    formState: { errors, isDirty },
  } = form;
  const phoneField = useMaskedField(register('phone'), maskPhone);
  const contactIsRequired = hasContact(user);

  const reportFailure = useCallback(
    (error: unknown) => {
      if (error instanceof SessionExpiredError) return;

      if (!(error instanceof ApiError)) {
        notifyError(C.USER_FORM_MESSAGES.failed);
        return;
      }

      const field = conflictFieldOf(error);

      if (field) {
        setError(field, { message: C.USER_CONFLICT_MESSAGES[field] }, { shouldFocus: true });
        return;
      }

      notifyError(errorMessageFor(error.status));
    },
    [notifyError, setError],
  );

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      await mutateAsync(values);
    } catch (error) {
      reportFailure(error);
    }
  });

  return (
    <Dialog.Form onSubmit={handleSubmit}>
      <Dialog.Body>
        <Dialog.Fields>
          <Dialog.Fields.Wide>
            <Input
              {...register('fullName')}
              label={FIELD_LABELS.fullName}
              required
              fullWidth
              autoComplete="off"
              maxLength={MAX_LENGTH.fullName}
              error={errors.fullName?.message}
            />
          </Dialog.Fields.Wide>

          <Dialog.Fields.Wide>
            <Input
              {...register('fatecEmail')}
              label={FIELD_LABELS.fatecEmail}
              required
              fullWidth
              type="email"
              autoComplete="off"
              maxLength={MAX_LENGTH.fatecEmail}
              error={errors.fatecEmail?.message}
            />
          </Dialog.Fields.Wide>

          <Input
            {...register('contactEmail')}
            label={CONTACT_FIELD_LABELS.contactEmail}
            required={contactIsRequired}
            fullWidth
            type="email"
            autoComplete="off"
            maxLength={MAX_CONTACT_EMAIL_LENGTH}
            error={errors.contactEmail?.message}
          />

          <Input
            {...phoneField}
            label={CONTACT_FIELD_LABELS.phone}
            required={contactIsRequired}
            fullWidth
            type="tel"
            inputMode="tel"
            autoComplete="off"
            error={errors.phone?.message}
          />

          {!isOwnAccount && (
            <Controller
              name="profileType"
              control={control}
              render={({ field }) => (
                <Input.Select
                  {...field}
                  label={C.PROFILE_TYPE_LABEL}
                  options={PROFILE_TYPE_OPTIONS}
                  required
                  error={errors.profileType?.message}
                />
              )}
            />
          )}
        </Dialog.Fields>
      </Dialog.Body>

      <Dialog.Footer>
        <Dialog.Submit
          icon={<SaveIcon fontSize="small" />}
          label={C.SUBMIT_LABEL}
          loading={isPending}
          disabled={!isDirty}
        />
      </Dialog.Footer>
    </Dialog.Form>
  );
}
