import { useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';

import { SaveBar } from '@app/components/SaveBar';
import { UnsavedChangesDialog } from '@app/components/UnsavedChangesDialog';
import { useLeaveConfirmation } from '@app/hooks/useLeaveConfirmation';
import type { User } from '@app/services/users/types';

import { PROFILE_UNSAVED_CHANGES_MESSAGE } from '../../constants';
import { toProfileFormValues } from '../../helpers/mapper';
import { hasPendingChanges } from '../../helpers/pendingChanges';
import { useProfileSave } from '../../hooks/useProfileSave';
import { profileSchema, type ProfileFormInput, type ProfileFormValues } from '../../schema';
import { AccountAccessCard } from '../AccountAccessCard';
import { AccountDataCard } from '../AccountDataCard';
import { PhotoCard } from '../PhotoCard';
import * as S from './styles';

export type ProfileFormProps = Readonly<{
  profile: User;
  onSaved: (profile: User) => void;
}>;

export function ProfileForm({ profile, onSaved }: ProfileFormProps) {
  const form = useForm<ProfileFormInput, unknown, ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: toProfileFormValues(profile),
  });
  const { save, isSaving } = useProfileSave({ form, profile, onSaved });
  const hasChanges = hasPendingChanges(form.formState.dirtyFields);
  const { confirming, confirmLeave, cancelLeave } = useLeaveConfirmation(hasChanges);

  const handleSubmit = form.handleSubmit(save);
  const handleDiscard = useCallback(() => form.reset(), [form]);

  return (
    <FormProvider {...form}>
      <S.ProfileFormRoot component="form" onSubmit={handleSubmit} noValidate>
        <S.CardsGrid>
          <S.CardArea area="photo">
            <PhotoCard storedPhotoUrl={profile.imageUrl} />
          </S.CardArea>
          <S.CardArea area="data">
            <AccountDataCard fatecEmail={profile.fatecEmail} />
          </S.CardArea>
          <S.CardArea area="access">
            <AccountAccessCard fatecEmail={profile.fatecEmail} />
          </S.CardArea>
        </S.CardsGrid>

        <SaveBar hasChanges={hasChanges} saving={isSaving} onDiscard={handleDiscard} />
        <UnsavedChangesDialog
          open={confirming}
          message={PROFILE_UNSAVED_CHANGES_MESSAGE}
          onCancel={cancelLeave}
          onDiscard={confirmLeave}
        />
      </S.ProfileFormRoot>
    </FormProvider>
  );
}
