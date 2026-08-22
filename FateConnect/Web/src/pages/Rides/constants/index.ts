export const RIDES_TITLE = 'Caronas';
export const BACK_LABEL = 'Voltar';
export const SEARCH_TAB_LABEL = 'Buscar Carona';
export const OFFER_TAB_LABEL = 'Ofertar Carona';

export const EMPTY_LIST_MESSAGE = 'Nenhuma carona encontrada.';

export const RIDE_LIST_MESSAGES = {
  loadFailed: 'Erro ao carregar caronas. Tente novamente.',
  deleteSucceeded: 'Carona excluída com sucesso.',
  deleteFailed: 'Erro ao excluir a carona. Tente novamente.',
  editSoon: 'Edição de carona em breve.',
};

export const DELETE_DIALOG = {
  title: 'Confirmar Exclusão',
  messagePrefix: 'Tem certeza que deseja excluir a carona para ',
  messageSuffix: '?',
  confirmLabel: 'Excluir',
  cancelLabel: 'Cancelar',
};

export const RIDE_CARD_LABELS = { edit: 'Editar', delete: 'Excluir', contact: 'Contato' };

export const CONTACT_DIALOG = {
  title: 'Informações de Contato',
  emailCopied: 'E-mail copiado!',
  emailCopyFailed: 'Não foi possível copiar o e-mail.',
  /** Texto que já vai escrito na conversa, para quem recebe saber de qual carona se trata. */
  message: (destination: string): string =>
    `Olá! Vi no FateConnect a sua carona para ${destination} e queria saber se ainda tem vaga.`,
};

const SINGLE_SEAT = 1;

export function seatsLabel(seats: number): string {
  if (seats === SINGLE_SEAT) return `${seats} vaga`;

  return `${seats} vagas`;
}
