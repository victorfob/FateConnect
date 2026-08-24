import { useCallback } from 'react';

import { LostItemStatusEnum, type LostItem } from '@app/services/lostAndFound/types';
import { Button } from '@design-system';

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

  if (!item.meuItem) return null;

  if (item.situacao === LostItemStatusEnum.CANCELLED) {
    return (
      <S.ActionRow>
        <Button type="button" variant="outlined" color="inherit" onClick={handleReopen}>
          {C.REOPEN_LABEL}
        </Button>
      </S.ActionRow>
    );
  }

  if (item.situacao !== LostItemStatusEnum.OPEN) return null;

  return (
    <S.ActionRow>
      <LostItemConfirmAction
        label={C.lostItemResolveLabel(item.tipo)}
        dialogTitle={C.RESOLVE_DIALOG.title}
        messagePrefix={C.RESOLVE_DIALOG.messagePrefix}
        itemName={item.nome}
        confirmLabel={C.RESOLVE_DIALOG.confirmLabel}
        onConfirm={handleResolve}
      />
    </S.ActionRow>
  );
}
