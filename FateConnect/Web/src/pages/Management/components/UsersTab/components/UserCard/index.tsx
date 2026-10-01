import { useCallback, useMemo } from 'react';
import { IconButton, InitialsAvatar, ListCard, StatusTag, Typography } from '@design-system';
import { EditIcon, EmailIcon, PhoneDisabledIcon, PhoneIcon } from '@design-system/icons';

import { useStoredImage } from '@app/hooks/useStoredImage';
import {
  accountStatusLabel,
  accountStatusTone,
} from '@app/pages/Management/components/UsersTab/helpers/accountStatus';
import type { UserSummary } from '@app/services/users/managementTypes';
import type { AccountStatusEnum } from '@app/services/users/types';
import { getInitials } from '@app/utils/initials';
import { maskPhone } from '@app/utils/masks/phoneMask';

import { UserStatusAction } from '../UserStatusAction';
import { EDIT_LABEL, NO_CONTACT_LABEL, OWN_ACCOUNT_LABEL } from './constants';
import * as S from './styles';

type UserCardProps = Readonly<{
  user: UserSummary;
  /** A API recusa banir e rebaixar a própria conta, então o cartão não oferece. */
  isOwnAccount: boolean;
  onEdit: (user: UserSummary) => void;
  onStatusConfirm: (user: UserSummary, status: AccountStatusEnum) => void;
}>;

export function UserCard({ user, isOwnAccount, onEdit, onStatusConfirm }: UserCardProps) {
  const handleEdit = useCallback(() => onEdit(user), [onEdit, user]);
  const photo = useStoredImage(user.thumbnailUrl);
  const initials = useMemo(() => getInitials(user.fullName), [user.fullName]);

  const displayPhone = useMemo(() => {
    if (!user.phone) return null;

    return maskPhone(user.phone);
  }, [user.phone]);

  return (
    <ListCard own={isOwnAccount} ownLabel={OWN_ACCOUNT_LABEL}>
      <ListCard.Header>
        <S.Identity>
          <InitialsAvatar
            initials={initials}
            label={user.fullName}
            photoSrc={photo.image?.objectUrl}
            loading={photo.loading}
          />
          <Typography variant="subtitleBold">{user.fullName}</Typography>
        </S.Identity>

        <ListCard.Actions>
          <StatusTag tone={accountStatusTone(user.status)}>
            {accountStatusLabel(user.status)}
          </StatusTag>

          <ListCard.ActionButtons>
            <IconButton type="button" label={EDIT_LABEL} onClick={handleEdit}>
              <EditIcon />
            </IconButton>
          </ListCard.ActionButtons>
        </ListCard.Actions>
      </ListCard.Header>

      <ListCard.InfoRow>
        {!user.contactEmail && !displayPhone && (
          <ListCard.InfoItem>
            <PhoneDisabledIcon />
            <Typography variant="caption" color="inherit">
              {NO_CONTACT_LABEL}
            </Typography>
          </ListCard.InfoItem>
        )}

        {displayPhone && (
          <ListCard.InfoItem>
            <PhoneIcon />
            <Typography variant="caption" color="inherit">
              {displayPhone}
            </Typography>
          </ListCard.InfoItem>
        )}

        {user.contactEmail && (
          <ListCard.InfoItem>
            <EmailIcon />
            <Typography variant="caption" color="inherit">
              {user.contactEmail}
            </Typography>
          </ListCard.InfoItem>
        )}
      </ListCard.InfoRow>

      {!isOwnAccount && <UserStatusAction user={user} onConfirm={onStatusConfirm} />}
    </ListCard>
  );
}
