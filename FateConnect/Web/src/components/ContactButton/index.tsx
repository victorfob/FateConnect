import { useCallback, useMemo, useState } from 'react';
import { Dialog, IconButton } from '@design-system';
import { ContactPageIcon } from '@design-system/icons';

import { useNotification } from '@app/hooks/useNotification';
import { copyToClipboard } from '@app/utils/clipboard';
import { getInitials } from '@app/utils/initials';
import { whatsappConversationUrl } from '@app/utils/whatsapp';

import { ContactDetails } from './ContactDetails';
import * as C from './constants';

type Contact = Readonly<{ name: string; email: string; phone: string }>;

type ContactButtonProps = Readonly<{ contact: Contact; message: string }>;

export function ContactButton({ contact, message }: ContactButtonProps) {
  const [showingContact, setShowingContact] = useState(false);
  const { notifySuccess, notifyError } = useNotification();

  const handleOpen = useCallback(() => setShowingContact(true), []);
  const handleClose = useCallback(() => setShowingContact(false), []);

  const handleCopyEmail = useCallback(async () => {
    const copied = await copyToClipboard(contact.email);

    if (!copied) {
      notifyError(C.CONTACT_DIALOG.emailCopyFailed);
      return;
    }

    notifySuccess(C.CONTACT_DIALOG.emailCopied);
  }, [contact.email, notifyError, notifySuccess]);

  const initials = useMemo(() => getInitials(contact.name), [contact.name]);
  const phoneHref = useMemo(
    () => whatsappConversationUrl(contact.phone, message),
    [contact.phone, message],
  );

  return (
    <>
      <IconButton type="button" label={C.CONTACT_LABEL} onClick={handleOpen}>
        <ContactPageIcon />
      </IconButton>

      <Dialog open={showingContact} onClose={handleClose} title={C.CONTACT_DIALOG.title}>
        <Dialog.Body>
          <ContactDetails
            name={contact.name}
            initials={initials}
            email={contact.email}
            phone={contact.phone}
            phoneHref={phoneHref}
            onCopyEmail={handleCopyEmail}
          />
        </Dialog.Body>
      </Dialog>
    </>
  );
}
