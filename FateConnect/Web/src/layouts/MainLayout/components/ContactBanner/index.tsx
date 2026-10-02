import { useCallback, useState, useSyncExternalStore } from 'react';
import { Link as RouterLink, useMatch } from 'react-router';
import { IconButton } from '@design-system';
import { CloseIcon } from '@design-system/icons';

import { REGISTER_CONTACTS_LABEL } from '@app/components/ContactRequiredDialog/constants';
import { useLacksContact } from '@app/hooks/useLacksContact';
import { RoutePathEnum } from '@app/routes/paths';
import { tokenStorage } from '@app/services/auth/tokenStorage';

import { contactBannerStorage } from './storage/contactBannerStorage';
import * as C from './constants';
import * as S from './styles';

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
    <S.Banner role="status">
      <S.BannerContent>
        <S.BannerText variant="caption" color="inherit">
          {C.CONTACT_BANNER_TEXT}
        </S.BannerText>

        {!onProfile && (
          <S.RegisterContactsLink
            component={RouterLink}
            to={RoutePathEnum.PROFILE}
            color="inherit"
            size="small"
          >
            {REGISTER_CONTACTS_LABEL}
          </S.RegisterContactsLink>
        )}
      </S.BannerContent>

      <IconButton
        label={C.DISMISS_BANNER_LABEL}
        color="inherit"
        size="small"
        onClick={handleDismiss}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </S.Banner>
  );
}
