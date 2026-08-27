import type { SelectOption } from '@design-system';

import { LOST_ITEM_KIND_OPTIONS } from '@app/pages/LostAndFound/helpers/lostItemKind';
import { LOST_ITEM_STATUS_OPTIONS } from '@app/pages/LostAndFound/helpers/lostItemStatus';

export const FILTER_PANEL_TITLE = 'Filtros';
export const FILTER_SUBMIT_LABEL = 'Filtrar';

export const FILTER_LABELS = {
  name: 'Nome',
  occurredOn: 'Data do ocorrido',
  kind: 'Tipo',
  owner: 'Dono',
  status: 'Situação',
};

export const FILTER_PLACEHOLDERS = { name: 'Insira o nome do item' };

/** `ALL` é sentinela do formulário: não vai para a requisição. */
export enum LostItemKindFilterEnum {
  ALL = '',
}

/** Dono não é campo da entidade: só `MINE` vira `onlyMine` na requisição. */
export enum LostItemOwnerFilterEnum {
  ALL = '',
  MINE = 'mine',
}

/** `ALL` é sentinela do formulário: não vai para a requisição. */
export enum LostItemStatusFilterEnum {
  ALL = '',
}

/** A sentinela do filtro na frente das mesmas escolhas que o cadastro oferece. */
export const LOST_ITEM_KIND_FILTER_OPTIONS: readonly SelectOption[] = [
  { value: LostItemKindFilterEnum.ALL, label: 'Todos' },
  ...LOST_ITEM_KIND_OPTIONS,
];

export const LOST_ITEM_OWNER_FILTER_OPTIONS: readonly SelectOption[] = [
  { value: LostItemOwnerFilterEnum.ALL, label: 'Todos os itens' },
  { value: LostItemOwnerFilterEnum.MINE, label: 'Meus itens' },
];

/** O mural abre em Aberto, então ver todas as situações é escolha de quem filtra. */
export const LOST_ITEM_STATUS_FILTER_OPTIONS: readonly SelectOption[] = [
  { value: LostItemStatusFilterEnum.ALL, label: 'Todas' },
  ...LOST_ITEM_STATUS_OPTIONS,
];
