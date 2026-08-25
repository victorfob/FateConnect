export const CONTACT_LABEL = 'Contato';

export const CONTACT_DIALOG = {
  title: 'Informações de Contato',
  emailCopied: 'E-mail copiado!',
  emailCopyFailed: 'Não foi possível copiar o e-mail.',
  /** Texto que já vai escrito na conversa, para quem recebe saber de qual item se trata. */
  message: (itemName: string): string =>
    `Olá! Vi no FateConnect o item "${itemName}" em Achados & Perdidos e queria falar sobre ele.`,
};
