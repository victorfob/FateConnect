export const LOST_AND_FOUND_TITLE = 'Achados & Perdidos';
export const BACK_LABEL = 'Voltar ao menu';
export const SEARCH_TAB_LABEL = 'Buscar item';
export const REGISTER_TAB_LABEL = 'Cadastrar item';

/** Chave do cache da lista; cadastrar e mudar de situação invalidam por ela. */
export const LOST_ITEMS_QUERY_KEY = 'lostItems';

export const EMPTY_LIST_MESSAGE = 'Nenhum item encontrado.';

export const UNDO_LABEL = 'Desfazer';

/**
 * O aviso do desfazer fica mais que o padrão de 3s: ação que ninguém tem tempo
 * de ler não é ação, e o item some da vista no mesmo instante porque o mural
 * abre em Aberto.
 */
export const UNDO_NOTICE_MS = 5000;

export const LOST_ITEM_LIST_MESSAGES = {
  loadFailed: 'Erro ao carregar os itens. Tente novamente.',
  resolveSucceeded: 'Item resolvido.',
  resolveFailed: 'Erro ao resolver o item. Tente novamente.',
  deleteSucceeded: 'Item arquivado.',
  deleteFailed: 'Erro ao arquivar o item. Tente novamente.',
  restoreSucceeded: 'Item restaurado.',
  restoreFailed: 'Erro ao restaurar o item. Tente novamente.',
};
