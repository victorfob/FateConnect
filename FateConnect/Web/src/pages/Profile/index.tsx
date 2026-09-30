import { PageShell } from '@design-system';

import { BackToMenu } from '@app/components/BackToMenu';
import { useProfile } from '@app/hooks/useProfile';

import { ProfileForm } from './components/ProfileForm';
import { PROFILE_TITLE } from './constants';

export function Profile() {
  const { data: profile, replaceProfile } = useProfile({ keepsPreviousProfile: true });

  return (
    <PageShell title={PROFILE_TITLE} action={<BackToMenu />}>
      {profile && <ProfileForm profile={profile} onSaved={replaceProfile} />}
    </PageShell>
  );
}
