import { useCallback } from 'react';
import { Button } from '@design-system';
import { CheckCircleIcon, RestoreIcon } from '@design-system/icons';

import { LostItemStatusEnum, type LostItem } from '@app/services/lostAndFound/types';

import { LostItemConfirmAction } from '../LostItemConfirmAction';
import * as C from './constants';
import * as S from './styles';

type LostItemStatusActionProps = Readonly<{
  item: LostItem;
  onResolve: (item: LostItem) => void;
  onReopen: (item: LostItem) => void;
}>;

export function LostItemStatusAction({ item, onResolve, onReopen }: LostItemStatusActionProps) {
  const handleResolve = useCallback(() => onResolve(item), [onResolve, item]);
  const handleReopen = useCallback(() => onReopen(item), [onReopen, item]);

  if (!item.isMine) return null;

  if (item.status === LostItemStatusEnum.DELETED) {
    return (
      <S.ActionRow>
        <Button type="button" variant="soft" onClick={handleReopen}>
          <RestoreIcon fontSize="small" />
          {C.REOPEN_LABEL}
        </Button>
      </S.ActionRow>
    );
  }

  if (item.status !== LostItemStatusEnum.OPEN) return null;

  return (
    <S.ActionRow>
      <LostItemConfirmAction
        label={C.lostItemResolveLabel(item.type)}
        icon={<CheckCircleIcon fontSize="small" />}
        dialogTitle={C.RESOLVE_DIALOG.title}
        messagePrefix={C.RESOLVE_DIALOG.messagePrefix}
        itemName={item.name}
        confirmLabel={C.RESOLVE_DIALOG.confirmLabel}
        onConfirm={handleResolve}
      />
    </S.ActionRow>
  );
}
