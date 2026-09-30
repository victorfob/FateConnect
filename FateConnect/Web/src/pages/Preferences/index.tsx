import { PageShell, SectionCard, Switch, Typography, useThemeMode } from '@design-system';
import { DarkModeIcon, LightModeIcon, SettingsIcon } from '@design-system/icons';

import { BackToMenu } from '@app/components/BackToMenu';

import * as C from './constants';
import * as S from './styles';

export function Preferences() {
  const { mode, toggleMode } = useThemeMode();

  return (
    <PageShell title={C.PREFERENCES_TITLE} action={<BackToMenu />}>
      <SectionCard title={C.APPEARANCE_SECTION_TITLE} icon={<SettingsIcon fontSize="small" />}>
        <S.SettingRow>
          <S.SettingText>
            <Typography variant="subtitleBold">{C.THEME_LABEL}</Typography>
            <S.SettingDescription variant="caption">{C.THEME_DESCRIPTION}</S.SettingDescription>
          </S.SettingText>

          <Switch
            checked={mode === 'dark'}
            onChange={toggleMode}
            slotProps={{ input: { 'aria-label': C.THEME_SWITCH_LABEL } }}
            icon={
              <S.SwitchThumb>
                <LightModeIcon />
              </S.SwitchThumb>
            }
            checkedIcon={
              <S.SwitchThumb>
                <DarkModeIcon />
              </S.SwitchThumb>
            }
          />
        </S.SettingRow>
      </SectionCard>
    </PageShell>
  );
}
