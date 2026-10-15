import { PageShell, SectionCard } from '@design-system';

import { BackToMenu } from '@app/components/BackToMenu';
import { ThemeMenu } from '@app/components/ThemeMenu';
import { THEME_LABEL } from '@app/components/ThemeMenu/constants';
import { usePreferences } from '@app/hooks/usePreferences';

import { NotificationsSwitch } from './components/NotificationsSwitch';
import { SettingText } from './components/SettingText';
import * as C from './constants';
import * as S from './styles';

export function Preferences() {
  const { data: preferences, replacePreferences } = usePreferences();

  return (
    <PageShell title={C.PREFERENCES_TITLE} action={<BackToMenu />}>
      <SectionCard>
        <S.SettingRow>
          <SettingText label={THEME_LABEL} description={C.THEME_DESCRIPTION} />
          <ThemeMenu />
        </S.SettingRow>

        {preferences && (
          <NotificationsSwitch preferences={preferences} replacePreferences={replacePreferences} />
        )}
      </SectionCard>
    </PageShell>
  );
}
