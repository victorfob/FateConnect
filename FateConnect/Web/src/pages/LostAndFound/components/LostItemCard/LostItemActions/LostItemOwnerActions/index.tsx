import { useCallback } from 'react';
import { IconButton } from '@design-system';
import { DeleteIcon, EditIcon } from '@design-system/icons';

import { LostItemConfirmAction } from '@app/pages/LostAndFound/components/LostItemCard/LostItemConfirmAction';
import { LostItemStatusEnum, type LostItem } from '@app/services/lostAndFound/types';

import * as C from '../constants';

type LostItemOwnerActionsProps = Readonly<{
  item: LostItem;
  onEdit?: (item: LostItem) => void;
  onDelete: (item: LostItem) => void;
}>;

export function LostItemOwnerActions({ item, onEdit, onDelete }: LostItemOwnerActionsProps) {
  const handleEdit = useCallback(() => onEdit?.(item), [onEdit, item]);
  const handleDelete = useCallback(() => onDelete(item), [onDelete, item]);

  if (!item.isMine) return null;

  // Vale para resolvido, para excluído e para o que a API venha a inventar.
  if (item.status !== LostItemStatusEnum.OPEN) return null;

  return (
    <>
      <IconButton type="button" label={C.LOST_ITEM_ACTION_LABELS.edit} onClick={handleEdit}>
        <EditIcon />
      </IconButton>

      <LostItemConfirmAction
        label={C.LOST_ITEM_ACTION_LABELS.delete}
        icon={<DeleteIcon />}
        iconOnly
        dialogTitle={C.DELETE_DIALOG.title}
        messagePrefix={C.DELETE_DIALOG.messagePrefix}
        itemName={item.name}
        confirmLabel={C.DELETE_DIALOG.confirmLabel}
        onConfirm={handleDelete}
      />
    </>
  );
}
