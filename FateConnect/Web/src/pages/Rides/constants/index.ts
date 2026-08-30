export const RIDES_TITLE = 'Caronas';
export const BACK_LABEL = 'Voltar ao menu';
export const SEARCH_TAB_LABEL = 'Buscar carona';
export const OFFER_TAB_LABEL = 'Ofertar carona';

/** Chave do cache da lista; ofertar e editar invalidam por ela. */
export const RIDES_QUERY_KEY = 'rides';

export const EMPTY_LIST_MESSAGE =
  'Nenhuma carona encontrada. As caronas oferecidas por quem estuda na Fatec aparecem aqui — ajuste os filtros ou oferte uma carona.';

export const RIDE_LIST_MESSAGES = {
  loadFailed: 'Erro ao carregar caronas. Tente novamente.',
  cancelSucceeded: 'Carona cancelada.',
  cancelFailed: 'Erro ao cancelar a carona. Tente novamente.',
};

export const RIDE_CARD_LABELS = { edit: 'Editar', cancel: 'Cancelar' };

/** A faixa na borda não fala com leitor de tela; este texto é quem conta. */
export const OWN_RIDE_LABEL = 'Minha carona';

const SINGLE_SEAT = 1;

export function seatsLabel(seats: number): string {
  if (seats === SINGLE_SEAT) return `${seats} vaga`;

  return `${seats} vagas`;
}
