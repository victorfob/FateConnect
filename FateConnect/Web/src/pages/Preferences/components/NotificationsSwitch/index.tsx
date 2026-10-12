import { useCallback, useId, type ChangeEvent } from 'react';
import { Switch } from '@design-system';

import type { Preferences } from '@app/services/users/preferencesTypes';

import { useNotificationsToggle } from '../../hooks/useNotificationsToggle';
import { SettingText } from '../SettingText';
import * as C from './constants';
import * as S from './styles';

export type NotificationsSwitchProps = Readonly<{
  preferences: Preferences;
  replacePreferences: (preferences: Preferences) => void;
}>;

export function NotificationsSwitch({ preferences, replacePreferences }: NotificationsSwitchProps) {
  const { toggle, saving } = useNotificationsToggle({ preferences, replacePreferences });
  const labelId = useId();
  const descriptionId = useId();

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => toggle(event.target.checked),
    [toggle],
  );

  return (
    <S.SwitchRow
      labelPlacement="start"
      disabled={saving}
      label={
        <SettingText
          label={C.NOTIFICATIONS_LABEL}
          description={C.NOTIFICATIONS_DESCRIPTION}
          labelId={labelId}
          descriptionId={descriptionId}
        />
      }
      control={
        <Switch
          checked={preferences.receiveNotifications}
          onChange={handleChange}
          slotProps={{ input: { 'aria-labelledby': labelId, 'aria-describedby': descriptionId } }}
        />
      }
    />
  );
}
