import { ContactRequiredActionEnum } from '../@types';

export const CONTACT_REQUIRED_TITLE = 'Contatos pendentes';

export const CONTACT_REQUIRED_MESSAGES: Readonly<Record<ContactRequiredActionEnum, string>> = {
  [ContactRequiredActionEnum.OFFER_RIDE]:
    'Para ofertar carona, cadastre telefone e e-mail para contato em Meu perfil.',
  [ContactRequiredActionEnum.REGISTER_ITEM]:
    'Para cadastrar um item, cadastre telefone e e-mail para contato em Meu perfil.',
};

export const CONTACT_REQUIRED_DISMISS_LABEL = 'Agora não';

export const REGISTER_CONTACTS_LABEL = 'Cadastrar contatos';
