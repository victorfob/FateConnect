import { isLostItemKind } from '@app/pages/LostAndFound/helpers/lostItemKind';
import { LostItemKindEnum } from '@app/services/lostAndFound/types';

export const LOST_ITEM_ACTION_LABELS = {
  edit: 'Editar',
  delete: 'Excluir',
  reopen: 'Reabrir',
};

/** O que encerra o item depende de quem o cadastrou ter ou não o objeto. */
const RESOLVE_LABEL: Readonly<Record<LostItemKindEnum, string>> = {
  [LostItemKindEnum.LOST]: 'Marcar como encontrado',
  [LostItemKindEnum.FOUND]: 'Marcar como devolvido',
};

const GENERIC_RESOLVE_LABEL = 'Concluir';

export function lostItemResolveLabel(kind: string): string {
  if (!isLostItemKind(kind)) return GENERIC_RESOLVE_LABEL;

  return RESOLVE_LABEL[kind];
}

export const RESOLVE_DIALOG = {
  title: 'Confirmar Conclusão',
  messagePrefix: 'Tem certeza que deseja concluir o item ',
  confirmLabel: 'Concluir',
};

export const DELETE_DIALOG = {
  title: 'Confirmar Exclusão',
  messagePrefix: 'Tem certeza que deseja excluir o item ',
  confirmLabel: 'Excluir',
};

export const CONFIRMATION = { messageSuffix: '?', cancelLabel: 'Cancelar' };
