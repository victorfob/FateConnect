import { Dialog } from '@design-system';
import { skipToken, useQuery } from '@tanstack/react-query';

import { getUser } from '@app/services/users/usersService';

import { UserEditForm } from './components/UserEditForm';
import * as C from './constants';

function userQueryFunction(userId: number | null) {
  if (userId === null) return skipToken;

  return () => getUser(userId);
}

type UserFormDialogProps = Readonly<{
  /** `null` fecha o diálogo. */
  userId: number | null;
  isOwnAccount: boolean;
  onClose: VoidFunction;
}>;

/**
 * O cartão só traz o resumo, e o formulário precisa do e-mail Fatec e do perfil:
 * ele nasce depois da leitura, já com os valores, em vez de recebê-los por cima.
 */
export function UserFormDialog({ userId, isOwnAccount, onClose }: UserFormDialogProps) {
  const { data: user } = useQuery({
    queryKey: [C.USER_QUERY_KEY, userId],
    queryFn: userQueryFunction(userId),
    meta: { errorMessage: C.USER_FORM_MESSAGES.loadFailed },
  });

  return (
    <Dialog open={userId !== null} onClose={onClose} title={C.EDIT_TITLE}>
      {user && (
        <UserEditForm key={user.id} user={user} isOwnAccount={isOwnAccount} onClose={onClose} />
      )}
    </Dialog>
  );
}
