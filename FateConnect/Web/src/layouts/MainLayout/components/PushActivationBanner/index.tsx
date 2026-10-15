import { useMemo } from 'react';

import { NoticeBanner } from '@app/components/NoticeBanner';
import type { NoticeBannerAction } from '@app/components/NoticeBanner/@types';

import { usePushActivation } from './hooks/usePushActivation';
import * as C from './constants';

export function PushActivationBanner() {
  const { visible, activate, dismiss } = usePushActivation();

  const activateAction = useMemo<NoticeBannerAction>(
    () => ({ label: C.ACTIVATE_PUSH_LABEL, onClick: activate }),
    [activate],
  );

  if (!visible) return null;

  return (
    <NoticeBanner
      tone="info"
      text={C.PUSH_BANNER_TEXT}
      action={activateAction}
      onDismiss={dismiss}
    />
  );
}
