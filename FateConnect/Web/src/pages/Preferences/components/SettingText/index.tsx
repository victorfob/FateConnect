import { Typography } from '@design-system';

import * as S from './styles';

export type SettingTextProps = Readonly<{
  label: string;
  description: string;
  labelId?: string;
  descriptionId?: string;
}>;

export function SettingText({ label, description, labelId, descriptionId }: SettingTextProps) {
  return (
    <S.SettingTextRoot>
      <Typography variant="subtitleBold" id={labelId}>
        {label}
      </Typography>
      <S.SettingDescription variant="caption" id={descriptionId}>
        {description}
      </S.SettingDescription>
    </S.SettingTextRoot>
  );
}
