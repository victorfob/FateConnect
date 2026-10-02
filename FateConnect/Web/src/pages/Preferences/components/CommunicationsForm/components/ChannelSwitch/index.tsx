import { useCallback, useId, type ChangeEvent } from 'react';
import { Switch } from '@design-system';
import { useController, useFormContext } from 'react-hook-form';

import { SettingText } from '@app/pages/Preferences/components/SettingText';
import type { Preferences } from '@app/services/users/preferencesTypes';

import * as S from './styles';

export type ChannelSwitchProps = Readonly<{
  name: keyof Preferences;
  label: string;
  description: string;
  /** Travado aparece desligado, sem mexer na escolha guardada. */
  locked?: boolean;
}>;

export function ChannelSwitch({ name, label, description, locked = false }: ChannelSwitchProps) {
  const { control } = useFormContext<Preferences>();
  const { field } = useController({ name, control });
  const labelId = useId();
  const descriptionId = useId();

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => field.onChange(event.target.checked),
    [field],
  );

  return (
    <S.ChannelRow
      labelPlacement="start"
      disabled={locked}
      label={
        <SettingText
          label={label}
          description={description}
          labelId={labelId}
          descriptionId={descriptionId}
        />
      }
      control={
        <Switch
          name={field.name}
          checked={field.value && !locked}
          onChange={handleChange}
          onBlur={field.onBlur}
          slotProps={{
            input: {
              ref: field.ref,
              'aria-labelledby': labelId,
              'aria-describedby': descriptionId,
            },
          }}
        />
      }
    />
  );
}
