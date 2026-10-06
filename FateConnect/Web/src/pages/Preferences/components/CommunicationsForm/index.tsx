import { useCallback } from 'react';
import { SectionCard, Typography } from '@design-system';
import { NotificationsIcon } from '@design-system/icons';
import { FormProvider, useForm } from 'react-hook-form';

import { SaveBar } from '@app/components/SaveBar';
import { UnsavedChangesDialog } from '@app/components/UnsavedChangesDialog';
import { useLacksContact } from '@app/hooks/useLacksContact';
import { useLeaveConfirmation } from '@app/hooks/useLeaveConfirmation';
import type { Preferences } from '@app/services/users/preferencesTypes';

import { usePreferencesSave } from '../../hooks/usePreferencesSave';
import { ChannelSwitch } from './components/ChannelSwitch';
import { MissingContactNote } from './components/MissingContactNote';
import * as C from './constants';
import * as S from './styles';

export type CommunicationsFormProps = Readonly<{
  preferences: Preferences;
  onSaved: (preferences: Preferences) => void;
}>;

export function CommunicationsForm({ preferences, onSaved }: CommunicationsFormProps) {
  const form = useForm<Preferences>({ defaultValues: preferences });
  const lacksContact = useLacksContact();
  const { save, isSaving } = usePreferencesSave({ form, onSaved });
  const hasChanges = form.formState.isDirty;
  const { confirming, confirmLeave, cancelLeave } = useLeaveConfirmation(hasChanges);

  const handleSubmit = form.handleSubmit(save);
  const handleDiscard = useCallback(() => form.reset(), [form]);

  return (
    <FormProvider {...form}>
      <S.CommunicationsFormRoot component="form" onSubmit={handleSubmit} noValidate>
        <SectionCard
          title={C.COMMUNICATIONS_SECTION_TITLE}
          icon={<NotificationsIcon fontSize="small" />}
        >
          <Typography variant="body" component="p">
            {C.COMMUNICATIONS_SUBTITLE}
          </Typography>

          <ChannelSwitch name="receiveNotifications" {...C.CHANNEL_TEXTS.app} />
          <ChannelSwitch name="receiveEmails" {...C.CHANNEL_TEXTS.email} locked={lacksContact} />

          {lacksContact && <MissingContactNote />}
        </SectionCard>

        <SaveBar hasChanges={hasChanges} saving={isSaving} onDiscard={handleDiscard} />
        <UnsavedChangesDialog
          open={confirming}
          message={C.PREFERENCES_UNSAVED_CHANGES_MESSAGE}
          onCancel={cancelLeave}
          onDiscard={confirmLeave}
        />
      </S.CommunicationsFormRoot>
    </FormProvider>
  );
}
