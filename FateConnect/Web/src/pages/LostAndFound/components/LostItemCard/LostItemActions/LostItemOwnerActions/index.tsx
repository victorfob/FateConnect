import { useCallback } from 'react';
import { IconButton } from '@design-system';
import { DeleteIcon, EditIcon } from '@design-system/icons';

import { LostItemConfirmAction } from '@app/pages/LostAndFound/components/LostItemCard/LostItemConfirmAction';
import { LostItemStatusEnum, type LostItem } from '@app/services/lostAndFound/types';

import * as C from '../constants';

type LostItemOwnerActionsProps = Readonly<{
  item: LostItem;
  onEdit?: (item: LostItem) => void;
  onCancel: (item: LostItem) => void;
}>;

export function LostItemOwnerActions({ item, onEdit, onCancel }: LostItemOwnerActionsProps) {
  const handleEdit = useCallback(() => onEdit?.(item), [onEdit, item]);
  const handleCancel = useCallback(() => onCancel(item), [onCancel, item]);

  if (!item.isMine) return null;

  // Vale para concluído, para cancelado e para o que a API venha a inventar.
  if (item.status !== LostItemStatusEnum.OPEN) return null;

  return (
    <>
      <IconButton type="button" label={C.LOST_ITEM_ACTION_LABELS.edit} onClick={handleEdit}>
        <EditIcon />
      </IconButton>

      <LostItemConfirmAction
        label={C.LOST_ITEM_ACTION_LABELS.cancel}
        icon={<DeleteIcon />}
        iconOnly
        dialogTitle={C.CANCEL_DIALOG.title}
        messagePrefix={C.CANCEL_DIALOG.messagePrefix}
        itemName={item.name}
        confirmLabel={C.CANCEL_DIALOG.confirmLabel}
        onConfirm={handleCancel}
      />
    </>
  );
}
