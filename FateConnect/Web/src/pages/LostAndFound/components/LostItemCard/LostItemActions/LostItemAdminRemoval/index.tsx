import { useCallback } from 'react';

import { PublicationRemoval } from '@app/components/PublicationRemoval';
import { LOST_ITEM_LIST_MESSAGES, LOST_ITEMS_QUERY_KEY } from '@app/pages/LostAndFound/constants';
import { loggedUserIsAdministrator } from '@app/services/auth/loggedUser';
import { removeLostItem } from '@app/services/lostAndFound/lostAndFoundService';
import type { LostItem } from '@app/services/lostAndFound/types';
import type { RemovalReasonEnum } from '@app/services/moderation/types';

import * as C from './constants';

type LostItemAdminRemovalProps = Readonly<{ item: LostItem }>;

const REMOVAL_MESSAGES = {
  succeeded: LOST_ITEM_LIST_MESSAGES.removeSucceeded,
  failed: LOST_ITEM_LIST_MESSAGES.removeFailed,
};

/** O item da própria pessoa se arquiva pela lixeira de quem cadastrou, e volta pelo Restaurar. */
export function LostItemAdminRemoval({ item }: LostItemAdminRemovalProps) {
  const handleRemove = useCallback(
    (reason: RemovalReasonEnum) => removeLostItem(item.id, reason),
    [item.id],
  );

  if (item.isOwner || !loggedUserIsAdministrator()) return null;

  return (
    <PublicationRemoval
      remove={handleRemove}
      queryKey={LOST_ITEMS_QUERY_KEY}
      messages={REMOVAL_MESSAGES}
    >
      {C.REMOVAL_MESSAGE.prefix}
      <strong>{item.name}</strong>
      {C.REMOVAL_MESSAGE.suffix}
    </PublicationRemoval>
  );
}
