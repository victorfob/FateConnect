import { useCallback } from 'react';

import { LostItemStatusEnum, type LostItem } from '@app/services/lostAndFound/types';
import { IconButton } from '@design-system';
import { CheckCircleIcon, DeleteIcon, EditIcon, RestoreIcon } from '@design-system/icons';

import * as C from '../constants';
import { LostItemConfirmAction } from './LostItemConfirmAction';

type LostItemOwnerActionsProps = Readonly<{
  item: LostItem;
  onEdit?: (item: LostItem) => void;
  onResolve: (item: LostItem) => void;
  onCancel: (item: LostItem) => void;
  onReopen: (item: LostItem) => void;
}>;

export function LostItemOwnerActions({
  item,
  onEdit,
  onResolve,
  onCancel,
  onReopen,
}: LostItemOwnerActionsProps) {
  const handleEdit = useCallback(() => onEdit?.(item), [onEdit, item]);
  const handleResolve = useCallback(() => onResolve(item), [onResolve, item]);
  const handleCancel = useCallback(() => onCancel(item), [onCancel, item]);
  const handleReopen = useCallback(() => onReopen(item), [onReopen, item]);

  if (!item.meuItem) return null;

  if (item.situacao === LostItemStatusEnum.CANCELLED) {
    return (
      <IconButton
        type="button"
        aria-label={C.LOST_ITEM_ACTION_LABELS.reopen}
        onClick={handleReopen}
      >
        <RestoreIcon />
      </IconButton>
    );
  }

  // Vale para concluído e para qualquer situação que a API venha a inventar.
  if (item.situacao !== LostItemStatusEnum.OPEN) return null;

  return (
    <>
      <IconButton type="button" aria-label={C.LOST_ITEM_ACTION_LABELS.edit} onClick={handleEdit}>
        <EditIcon />
      </IconButton>

      <LostItemConfirmAction
        label={C.lostItemResolveLabel(item.tipo)}
        icon={<CheckCircleIcon />}
        dialogTitle={C.RESOLVE_DIALOG.title}
        messagePrefix={C.RESOLVE_DIALOG.messagePrefix}
        itemName={item.nome}
        confirmLabel={C.RESOLVE_DIALOG.confirmLabel}
        onConfirm={handleResolve}
      />

      <LostItemConfirmAction
        label={C.LOST_ITEM_ACTION_LABELS.delete}
        icon={<DeleteIcon />}
        dialogTitle={C.DELETE_DIALOG.title}
        messagePrefix={C.DELETE_DIALOG.messagePrefix}
        itemName={item.nome}
        confirmLabel={C.DELETE_DIALOG.confirmLabel}
        onConfirm={handleCancel}
      />
    </>
  );
}
