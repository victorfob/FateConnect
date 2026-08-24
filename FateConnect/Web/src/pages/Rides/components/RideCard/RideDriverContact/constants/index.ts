export const CONTACT_DIALOG = {
  title: 'Informações de Contato',
  emailCopied: 'E-mail copiado!',
  emailCopyFailed: 'Não foi possível copiar o e-mail.',
  /** Texto que já vai escrito na conversa, para quem recebe saber de qual carona se trata. */
  message: (destination: string): string =>
    `Olá! Vi no FateConnect a sua carona para ${destination} e queria saber se ainda tem vaga.`,
};
