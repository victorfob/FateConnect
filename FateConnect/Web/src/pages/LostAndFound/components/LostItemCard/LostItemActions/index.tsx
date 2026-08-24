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

/**
 * A fileira de ações do cartão. Ela existe mesmo quando o item é de outra
 * pessoa, porque o contato de quem cadastrou aparece para todo mundo e entra
 * aqui ao lado das ações do dono.
 */
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
