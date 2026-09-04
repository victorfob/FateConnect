import { NavLink } from 'react-router';
import { PageShell, Typography, useThemeMode } from '@design-system';
import { ArrowBackIcon, DarkModeIcon, LightModeIcon, SettingsIcon } from '@design-system/icons';

import { RoutePathEnum } from '@app/routes/paths';

import * as C from './constants';
import * as S from './styles';

export function Preferences() {
  const { mode, toggleMode } = useThemeMode();

  return (
    <PageShell
      title={C.PREFERENCES_TITLE}
      action={
        <PageShell.Back
          label={C.BACK_LABEL}
          icon={<ArrowBackIcon fontSize="small" />}
          component={NavLink}
          to={RoutePathEnum.MENU}
        />
      }
    >
      <S.SettingsCard>
        <S.SectionHeading variant="h2">
          <SettingsIcon fontSize="small" />
          {C.APPEARANCE_SECTION_TITLE}
        </S.SectionHeading>

        <S.SettingRow>
          <S.SettingText>
            <Typography variant="subtitleBold">{C.THEME_LABEL}</Typography>
            <S.SettingDescription variant="caption">{C.THEME_DESCRIPTION}</S.SettingDescription>
          </S.SettingText>

          <S.ThemeSwitch
            disableRipple
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
      </S.SettingsCard>
    </PageShell>
  );
}
