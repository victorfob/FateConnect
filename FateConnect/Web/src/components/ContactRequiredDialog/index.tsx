import { Link as RouterLink } from 'react-router';
import { Button, Dialog } from '@design-system';

import { RoutePathEnum } from '@app/routes/paths';

import type { ContactRequiredActionEnum } from './@types';
import * as C from './constants';

type ContactRequiredDialogProps = Readonly<{
  open: boolean;
  action: ContactRequiredActionEnum;
  onClose: VoidFunction;
}>;

/** Abre no lugar do formulário de quem ainda não cadastrou telefone e e-mail para contato. */
export function ContactRequiredDialog({ open, action, onClose }: ContactRequiredDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title={C.CONTACT_REQUIRED_TITLE}>
      <Dialog.Body>
        <Dialog.Message>{C.CONTACT_REQUIRED_MESSAGES[action]}</Dialog.Message>
      </Dialog.Body>

      <Dialog.Footer>
        <Button type="button" variant="contained" color="primary" onClick={onClose}>
          {C.CONTACT_REQUIRED_DISMISS_LABEL}
        </Button>
        <Button
          variant="contained"
          color="secondary"
          component={RouterLink}
          to={RoutePathEnum.PROFILE}
        >
          {C.REGISTER_CONTACTS_LABEL}
        </Button>
      </Dialog.Footer>
    </Dialog>
  );
}
