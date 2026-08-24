import { useCallback } from 'react';

import { LostItemStatusEnum, type LostItem } from '@app/services/lostAndFound/types';
import { IconButton, Tooltip } from '@design-system';
import { DeleteIcon, EditIcon } from '@design-system/icons';

import { LostItemConfirmAction } from '../../LostItemConfirmAction';
import * as C from '../constants';

type LostItemOwnerActionsProps = Readonly<{
  item: LostItem;
  onEdit?: (item: LostItem) => void;
  onCancel: (item: LostItem) => void;
}>;

export function LostItemOwnerActions({ item, onEdit, onCancel }: LostItemOwnerActionsProps) {
  const handleEdit = useCallback(() => onEdit?.(item), [onEdit, item]);
  const handleCancel = useCallback(() => onCancel(item), [onCancel, item]);

  if (!item.meuItem) return null;

  // Vale para concluído, para cancelado e para o que a API venha a inventar.
  if (item.situacao !== LostItemStatusEnum.OPEN) return null;

  return (
    <>
      <Tooltip title={C.LOST_ITEM_ACTION_LABELS.edit}>
        <IconButton type="button" aria-label={C.LOST_ITEM_ACTION_LABELS.edit} onClick={handleEdit}>
          <EditIcon />
        </IconButton>
      </Tooltip>

      <LostItemConfirmAction
        label={C.LOST_ITEM_ACTION_LABELS.delete}
        icon={<DeleteIcon />}
        iconOnly
        dialogTitle={C.DELETE_DIALOG.title}
        messagePrefix={C.DELETE_DIALOG.messagePrefix}
        itemName={item.nome}
        confirmLabel={C.DELETE_DIALOG.confirmLabel}
        onConfirm={handleCancel}
      />
    </>
  );
}
