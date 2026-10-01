import { useCallback, useState } from 'react';

import { useLacksContact } from '@app/hooks/useLacksContact';
import { useProfile } from '@app/hooks/useProfile';

/** Carona e item só se publicam com contato: sem ele, a ação abre o aviso no lugar do formulário. */
export function useContactGate() {
  const { refetch } = useProfile();
  const lacksContact = useLacksContact();
  const [contactDialogOpen, setContactDialogOpen] = useState(false);

  const guard = useCallback(
    (publish: VoidFunction) => {
      if (lacksContact) {
        setContactDialogOpen(true);
        return;
      }

      publish();
    },
    [lacksContact],
  );

  // A API recusou com o perfil em cache dizendo o contrário: ele envelheceu.
  const showContactRequired = useCallback(() => {
    setContactDialogOpen(true);
    void refetch();
  }, [refetch]);

  const closeContactDialog = useCallback(() => setContactDialogOpen(false), []);

  return { contactDialogOpen, guard, showContactRequired, closeContactDialog };
}
