import { PageShell, SectionCard } from '@design-system';
import { SettingsIcon } from '@design-system/icons';

import { BackToMenu } from '@app/components/BackToMenu';
import { ThemeMenu } from '@app/components/ThemeMenu';
import { THEME_LABEL } from '@app/components/ThemeMenu/constants';

import { CommunicationsForm } from './components/CommunicationsForm';
import { SettingText } from './components/SettingText';
import { usePreferences } from './hooks/usePreferences';
import * as C from './constants';
import * as S from './styles';

export function Preferences() {
  const { data: preferences, replacePreferences } = usePreferences();

  return (
    <PageShell title={C.PREFERENCES_TITLE} action={<BackToMenu />}>
      <S.PreferencesSections>
        <SectionCard title={C.APPEARANCE_SECTION_TITLE} icon={<SettingsIcon fontSize="small" />}>
          <S.SettingRow>
            <SettingText label={THEME_LABEL} description={C.THEME_DESCRIPTION} />
            <ThemeMenu />
          </S.SettingRow>
        </SectionCard>

        {preferences && (
          <CommunicationsForm preferences={preferences} onSaved={replacePreferences} />
        )}
      </S.PreferencesSections>
    </PageShell>
  );
}
