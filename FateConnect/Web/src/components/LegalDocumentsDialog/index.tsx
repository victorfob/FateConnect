import { useMemo } from 'react';
import { Button, Dialog } from '@design-system';

import { DeactivateAccount } from '@app/components/DeactivateAccount';
import { useSignOut } from '@app/hooks/useSignOut';

import { PendingDocumentsMessage } from './components/PendingDocumentsMessage';
import { useLegalDocuments } from './hooks/useLegalDocuments';
import * as C from './constants';

const NO_PENDING_DOCUMENTS = 0;

/** Segura o uso enquanto houver documento com versão nova sem aceite: não se dispensa. */
export function LegalDocumentsDialog() {
  const signOut = useSignOut();
  const { pending, accept, accepting } = useLegalDocuments();

  const pendingDocuments = useMemo(() => pending.map(({ document }) => document), [pending]);

  if (pendingDocuments.length === NO_PENDING_DOCUMENTS) return null;

  return (
    <Dialog open title={C.LEGAL_DOCUMENTS_TITLE}>
      <Dialog.Body>
        <Dialog.Message tone="info">
          <PendingDocumentsMessage documents={pendingDocuments} />
          {C.DISAGREEMENT.prefix}
          <DeactivateAccount asLink label={C.DISAGREEMENT.deactivateLink} />
          {C.DISAGREEMENT.suffix}
        </Dialog.Message>
      </Dialog.Body>

      <Dialog.Footer>
        <Button type="button" variant="contained" color="primary" onClick={signOut}>
          {C.SIGN_OUT_LABEL}
        </Button>
        <Button
          type="button"
          variant="contained"
          color="secondary"
          loading={accepting}
          onClick={accept}
        >
          {C.ACCEPT_LABEL}
        </Button>
      </Dialog.Footer>
    </Dialog>
  );
}
