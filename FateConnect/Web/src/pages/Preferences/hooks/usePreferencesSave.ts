import { useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { UseFormReturn } from 'react-hook-form';

import { useNotification } from '@app/hooks/useNotification';
import { updatePreferences } from '@app/services/users/preferencesService';
import type { Preferences } from '@app/services/users/preferencesTypes';

import { PREFERENCES_MESSAGES } from '../constants';
import { changedPreferences } from '../helpers/changedPreferences';

type UsePreferencesSaveInput = Readonly<{
  form: UseFormReturn<Preferences>;
  onSaved: (preferences: Preferences) => void;
}>;

export function usePreferencesSave({ form, onSaved }: UsePreferencesSaveInput) {
  const { notifySuccess, notifyError } = useNotification();

  const mutation = useMutation({
    mutationFn: updatePreferences,
    meta: { notifiesErrorItself: true },
  });

  const save = useCallback(
    async (values: Preferences) => {
      try {
        await mutation.mutateAsync(changedPreferences(values, form.formState.dirtyFields));
      } catch {
        notifyError(PREFERENCES_MESSAGES.saveFailed);
        return;
      }

      form.reset(values);
      onSaved(values);
      notifySuccess(PREFERENCES_MESSAGES.saved);
    },
    [form, mutation, notifyError, notifySuccess, onSaved],
  );

  return { save, isSaving: mutation.isPending };
}
