import { ListCard } from '@design-system';

import type { LostItem } from '@app/services/lostAndFound/types';

import { LostItemOwnerContact } from '../LostItemOwnerContact';
import { LostItemOwnerActions } from './LostItemOwnerActions';

type LostItemActionsProps = Readonly<{
  item: LostItem;
  onEdit?: (item: LostItem) => void;
  onCancel: (item: LostItem) => void;
}>;

/** Existe mesmo sem ações do dono: o contato entra aqui e é de todo mundo. */
export function LostItemActions({ item, onEdit, onCancel }: LostItemActionsProps) {
  return (
    <ListCard.ActionButtons>
      <LostItemOwnerContact item={item} />

      <LostItemOwnerActions item={item} onEdit={onEdit} onCancel={onCancel} />
    </ListCard.ActionButtons>
  );
}
