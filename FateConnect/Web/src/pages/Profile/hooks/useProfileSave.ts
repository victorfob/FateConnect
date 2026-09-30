import { useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { UseFormReturn } from 'react-hook-form';

import { useNotification } from '@app/hooks/useNotification';
import { ApiError } from '@app/services/httpClient';
import {
  changePassword,
  removeProfileImage,
  updateProfile,
} from '@app/services/users/profileService';
import type { PasswordChangeInput } from '@app/services/users/profileTypes';
import type { User } from '@app/services/users/types';

import { toProfileFormValues, toProfileInput } from '../helpers/mapper';
import type { ProfileFormInput, ProfileFormValues } from '../schema';
import * as C from '../constants';

const BAD_REQUEST = 400;

type ProfileForm = UseFormReturn<ProfileFormInput, unknown, ProfileFormValues>;

type UseProfileSaveInput = Readonly<{
  form: ProfileForm;
  profile: User;
  onSaved: (profile: User) => void;
}>;

const PASSWORD_FIELDS: ReadonlySet<string> = new Set(['currentPassword', 'newPassword']);

async function saveProfileData(values: ProfileFormValues): Promise<User> {
  const saved = await updateProfile(toProfileInput(values));
  if (!values.removeStoredPhoto || values.photo) return saved;

  await removeProfileImage();

  return { ...saved, imageUrl: null };
}

function changesProfileData(dirtyFields: object): boolean {
  return Object.keys(dirtyFields).some((field) => !PASSWORD_FIELDS.has(field));
}

/**
 * Um salvar só: os dados primeiro, depois a senha, que só é tocada com os dois
 * campos preenchidos. A senha recusada não desfaz os dados já gravados.
 */
export function useProfileSave({ form, profile, onSaved }: UseProfileSaveInput) {
  const { notifySuccess, notifyError } = useNotification();

  const dataMutation = useMutation({
    mutationFn: saveProfileData,
    meta: { notifiesErrorItself: true },
  });
  const passwordMutation = useMutation({
    mutationFn: (input: PasswordChangeInput) => changePassword(input),
    meta: { notifiesErrorItself: true },
  });

  const reportPasswordFailure = useCallback(
    (error: unknown) => {
      // A API responde 400 a toda recusa de domínio, e as outras o formulário barra antes.
      if (error instanceof ApiError && error.status === BAD_REQUEST) {
        form.setError(
          'currentPassword',
          { message: C.PROFILE_MESSAGES.currentPasswordWrong },
          { shouldFocus: true },
        );
        return;
      }

      notifyError(C.PROFILE_MESSAGES.passwordFailed);
    },
    [form, notifyError],
  );

  const save = useCallback(
    async (values: ProfileFormValues) => {
      const savesData = changesProfileData(form.formState.dirtyFields);
      let saved = profile;

      if (savesData) {
        try {
          saved = await dataMutation.mutateAsync(values);
        } catch {
          notifyError(C.PROFILE_MESSAGES.saveFailed);
          return;
        }

        onSaved(saved);
        notifySuccess(C.PROFILE_MESSAGES.saved);
      }

      const savedValues = toProfileFormValues(saved);

      if (values.newPassword === '') {
        form.reset(savedValues);
        return;
      }

      try {
        await passwordMutation.mutateAsync({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        });
      } catch (error) {
        // Os dados gravados viram o novo ponto de partida; a senha recusada segue pendente.
        form.reset(savedValues);
        form.setValue('currentPassword', values.currentPassword, { shouldDirty: true });
        form.setValue('newPassword', values.newPassword, { shouldDirty: true });
        reportPasswordFailure(error);
        return;
      }

      form.reset(savedValues);
      if (!savesData) notifySuccess(C.PROFILE_MESSAGES.passwordChanged);
    },
    [
      dataMutation,
      form,
      notifyError,
      notifySuccess,
      onSaved,
      passwordMutation,
      profile,
      reportPasswordFailure,
    ],
  );

  return { save, isSaving: dataMutation.isPending || passwordMutation.isPending };
}
