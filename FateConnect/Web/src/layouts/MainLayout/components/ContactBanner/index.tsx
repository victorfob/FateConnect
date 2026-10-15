import { useCallback, useState, useSyncExternalStore } from 'react';
import { useMatch } from 'react-router';

import { REGISTER_CONTACTS_LABEL } from '@app/components/ContactRequiredDialog/constants';
import { NoticeBanner } from '@app/components/NoticeBanner';
import type { NoticeBannerAction } from '@app/components/NoticeBanner/@types';
import { useLacksContact } from '@app/hooks/useLacksContact';
import { RoutePathEnum } from '@app/routes/paths';
import { tokenStorage } from '@app/services/auth/tokenStorage';

import { contactBannerStorage } from './storage/contactBannerStorage';
import * as C from './constants';

const REGISTER_CONTACTS_ACTION: NoticeBannerAction = {
  label: REGISTER_CONTACTS_LABEL,
  to: RoutePathEnum.PROFILE,
};

/** Avisa quem está sem contato, em toda tela logada; fechada, volta no próximo login. */
export function ContactBanner() {
  const lacksContact = useLacksContact();
  const onProfile = useMatch(RoutePathEnum.PROFILE) !== null;
  const token = useSyncExternalStore(tokenStorage.subscribe, tokenStorage.getToken);
  const [dismissed, setDismissed] = useState(() => contactBannerStorage.isDismissedFor(token));

  const handleDismiss = useCallback(() => {
    contactBannerStorage.dismissFor(token);
    setDismissed(true);
  }, [token]);

  if (!lacksContact || dismissed) return null;

  return (
    <NoticeBanner
      tone="warning"
      text={C.CONTACT_BANNER_TEXT}
      action={onProfile ? undefined : REGISTER_CONTACTS_ACTION}
      onDismiss={handleDismiss}
    />
  );
}
