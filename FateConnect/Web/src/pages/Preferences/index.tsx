import { PageShell, SectionCard, Typography } from '@design-system';
import { SettingsIcon } from '@design-system/icons';

import { BackToMenu } from '@app/components/BackToMenu';
import { ThemeMenu } from '@app/components/ThemeMenu';
import { THEME_LABEL } from '@app/components/ThemeMenu/constants';

import * as C from './constants';
import * as S from './styles';

export function Preferences() {
  return (
    <PageShell title={C.PREFERENCES_TITLE} action={<BackToMenu />}>
      <SectionCard title={C.APPEARANCE_SECTION_TITLE} icon={<SettingsIcon fontSize="small" />}>
        <S.SettingRow>
          <S.SettingText>
            <Typography variant="subtitleBold">{THEME_LABEL}</Typography>
            <S.SettingDescription variant="caption">{C.THEME_DESCRIPTION}</S.SettingDescription>
          </S.SettingText>

          <ThemeMenu />
        </S.SettingRow>
      </SectionCard>
    </PageShell>
  );
}
