import { useCallback } from 'react';
import { Button, ListCard } from '@design-system';
import { CheckCircleIcon, RestoreIcon } from '@design-system/icons';

import { ConfirmAction } from '@app/components/ConfirmAction';
import { LostItemStatusEnum, type LostItem } from '@app/services/lostAndFound/types';

import * as C from './constants';

type LostItemStatusActionProps = Readonly<{
  item: LostItem;
  onResolve: (item: LostItem) => void;
  onRestore: (item: LostItem) => void;
}>;

export function LostItemStatusAction({ item, onResolve, onRestore }: LostItemStatusActionProps) {
  const handleResolve = useCallback(() => onResolve(item), [onResolve, item]);
  const handleRestore = useCallback(() => onRestore(item), [onRestore, item]);

  if (!item.isOwner) return null;

  if (item.status === LostItemStatusEnum.DELETED) {
    return (
      <ListCard.BottomAction>
        <Button type="button" variant="soft" size="small" onClick={handleRestore}>
          <RestoreIcon fontSize="small" />
          {C.RESTORE_LABEL}
        </Button>
      </ListCard.BottomAction>
    );
  }

  if (item.status !== LostItemStatusEnum.OPEN) return null;

  const resolveLabel = C.lostItemResolveLabel(item.lostAndFoundType);

  return (
    <ListCard.BottomAction>
      <ConfirmAction
        label={resolveLabel}
        icon={<CheckCircleIcon fontSize="small" />}
        dialogTitle={resolveLabel}
        messagePrefix={C.RESOLVE_DIALOG.messagePrefix}
        messageSuffix={C.lostItemResolveSuffix(item.lostAndFoundType)}
        subject={item.name}
        confirmLabel={C.RESOLVE_DIALOG.confirmLabel}
        size="small"
        onConfirm={handleResolve}
      />
    </ListCard.BottomAction>
  );
}
