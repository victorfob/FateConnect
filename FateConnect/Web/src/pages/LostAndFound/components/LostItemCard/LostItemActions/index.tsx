import type { LostItem } from '@app/services/lostAndFound/types';

import { LostItemOwnerActions } from './LostItemOwnerActions';
import * as S from './styles';

type LostItemActionsProps = Readonly<{
  item: LostItem;
  onEdit?: (item: LostItem) => void;
  onResolve: (item: LostItem) => void;
  onCancel: (item: LostItem) => void;
  onReopen: (item: LostItem) => void;
}>;

/** Existe mesmo sem ações do dono: o contato entra aqui e é de todo mundo. */
export function LostItemActions({
  item,
  onEdit,
  onResolve,
  onCancel,
  onReopen,
}: LostItemActionsProps) {
  return (
    <S.ActionButtons>
      <LostItemOwnerActions
        item={item}
        onEdit={onEdit}
        onResolve={onResolve}
        onCancel={onCancel}
        onReopen={onReopen}
      />
    </S.ActionButtons>
  );
}
