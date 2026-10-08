import { useCallback, useMemo, useState } from 'react';
import { Dialog, IconButton } from '@design-system';
import { ContactPageIcon } from '@design-system/icons';

import type { UserContact } from '@app/services/types';
import { getInitials } from '@app/utils/initials';
import { maskPhone } from '@app/utils/masks/phoneMask';
import { whatsappConversationUrl } from '@app/utils/whatsapp';

import { ContactDetails } from './ContactDetails';
import * as C from './constants';

type ContactButtonProps = Readonly<{ contact: UserContact; message: string }>;

export function ContactButton({ contact, message }: ContactButtonProps) {
  const [showingContact, setShowingContact] = useState(false);

  const handleOpen = useCallback(() => setShowingContact(true), []);
  const handleClose = useCallback(() => setShowingContact(false), []);

  const initials = useMemo(() => getInitials(contact.name), [contact.name]);
  // A máscara é só de exibição: o endereço da conversa recebe o número como a
  // API o devolve, porque é o mesmo valor em dois papéis diferentes.
  const displayPhone = useMemo(() => {
    if (!contact.phone) return null;

    return maskPhone(contact.phone);
  }, [contact.phone]);
  const phoneHref = useMemo(() => {
    if (!contact.phone) return null;

    return whatsappConversationUrl(contact.phone, message);
  }, [contact.phone, message]);

  return (
    <>
      <IconButton type="button" size="small" label={C.CONTACT_LABEL} onClick={handleOpen}>
        <ContactPageIcon />
      </IconButton>

      <Dialog open={showingContact} onClose={handleClose} title={C.CONTACT_DIALOG.title}>
        <Dialog.Body>
          <ContactDetails
            name={contact.name}
            initials={initials}
            thumbnailUrl={contact.thumbnailUrl}
            email={contact.email}
            phone={displayPhone}
            phoneHref={phoneHref}
          />
        </Dialog.Body>
      </Dialog>
    </>
  );
}
