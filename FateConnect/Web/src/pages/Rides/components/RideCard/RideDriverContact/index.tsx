import { useCallback, useMemo, useState } from 'react';

import { useNotification } from '@app/hooks/useNotification';
import { RIDE_CARD_LABELS } from '@app/pages/Rides/constants';
import { isOwnRide, RIDE_DRIVER } from '@app/pages/Rides/helpers/rideDriver';
import { copyToClipboard } from '@app/utils/clipboard';
import { getInitials } from '@app/utils/initials';
import { whatsappConversationUrl } from '@app/utils/whatsapp';
import { Dialog, IconButton } from '@design-system';
import { ContactPageIcon } from '@design-system/icons';

import { ContactDetails } from '../ContactDetails';
import { CONTACT_DIALOG } from './constants';

type RideDriverContactProps = Readonly<{
  /** Destino da carona, citado na mensagem que já vai escrita na conversa. */
  destination: string;
}>;

/**
 * Contato de quem ofertou a carona: o botão no cartão e o diálogo que ele abre.
 * Não aparece na minha própria carona.
 */
export function RideDriverContact({ destination }: RideDriverContactProps) {
  const [showingContact, setShowingContact] = useState(false);
  const { notifySuccess, notifyError } = useNotification();

  const handleOpen = useCallback(() => setShowingContact(true), []);
  const handleClose = useCallback(() => setShowingContact(false), []);

  const handleCopyEmail = useCallback(async () => {
    const copied = await copyToClipboard(RIDE_DRIVER.email);

    if (!copied) {
      notifyError(CONTACT_DIALOG.emailCopyFailed);
      return;
    }

    notifySuccess(CONTACT_DIALOG.emailCopied);
  }, [notifyError, notifySuccess]);

  const initials = useMemo(() => getInitials(RIDE_DRIVER.name), []);
  const phoneHref = useMemo(
    () => whatsappConversationUrl(RIDE_DRIVER.phone, CONTACT_DIALOG.message(destination)),
    [destination],
  );

  if (isOwnRide(RIDE_DRIVER)) return null;

  return (
    <>
      <IconButton type="button" aria-label={RIDE_CARD_LABELS.contact} onClick={handleOpen}>
        <ContactPageIcon />
      </IconButton>

      <Dialog open={showingContact} onClose={handleClose} title={CONTACT_DIALOG.title}>
        <Dialog.Body>
          <ContactDetails
            name={RIDE_DRIVER.name}
            initials={initials}
            email={RIDE_DRIVER.email}
            phone={RIDE_DRIVER.phone}
            phoneHref={phoneHref}
            onCopyEmail={handleCopyEmail}
          />
        </Dialog.Body>
      </Dialog>
    </>
  );
}
