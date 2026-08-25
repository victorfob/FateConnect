import { useCallback, useMemo, useState } from 'react';

import { useNotification } from '@app/hooks/useNotification';
import { LOST_ITEM_OWNER } from '@app/pages/LostAndFound/helpers/lostItemOwner';
import { ContactDetails } from '@app/pages/Rides/components/RideCard/ContactDetails';
import type { LostItem } from '@app/services/lostAndFound/types';
import { copyToClipboard } from '@app/utils/clipboard';
import { getInitials } from '@app/utils/initials';
import { whatsappConversationUrl } from '@app/utils/whatsapp';
import { Dialog, IconButton } from '@design-system';
import { ContactPageIcon } from '@design-system/icons';

import * as C from './constants';

type LostItemOwnerContactProps = Readonly<{ item: LostItem }>;

/**
 * Contato de quem cadastrou o item: o botão no cartão e o diálogo que ele abre.
 * Não aparece no meu próprio item, e **não olha para a situação** — devolver o
 * objeto é justamente o que continua a ser combinado depois de o item ser
 * concluído, então só as ações do dono somem lá.
 */
export function LostItemOwnerContact({ item }: LostItemOwnerContactProps) {
  const [showingContact, setShowingContact] = useState(false);
  const { notifySuccess, notifyError } = useNotification();

  const handleOpen = useCallback(() => setShowingContact(true), []);
  const handleClose = useCallback(() => setShowingContact(false), []);

  const handleCopyEmail = useCallback(async () => {
    const copied = await copyToClipboard(LOST_ITEM_OWNER.email);

    if (!copied) {
      notifyError(C.CONTACT_DIALOG.emailCopyFailed);
      return;
    }

    notifySuccess(C.CONTACT_DIALOG.emailCopied);
  }, [notifyError, notifySuccess]);

  const initials = useMemo(() => getInitials(LOST_ITEM_OWNER.name), []);
  const phoneHref = useMemo(
    () => whatsappConversationUrl(LOST_ITEM_OWNER.phone, C.CONTACT_DIALOG.message(item.nome)),
    [item.nome],
  );

  if (item.meuItem) return null;

  return (
    <>
      <IconButton type="button" aria-label={C.CONTACT_LABEL} onClick={handleOpen}>
        <ContactPageIcon />
      </IconButton>

      <Dialog open={showingContact} onClose={handleClose} title={C.CONTACT_DIALOG.title}>
        <Dialog.Body>
          <ContactDetails
            name={LOST_ITEM_OWNER.name}
            initials={initials}
            email={LOST_ITEM_OWNER.email}
            phone={LOST_ITEM_OWNER.phone}
            phoneHref={phoneHref}
            onCopyEmail={handleCopyEmail}
          />
        </Dialog.Body>
      </Dialog>
    </>
  );
}
