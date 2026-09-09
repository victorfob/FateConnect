import { isLostItemKind } from '@app/pages/LostAndFound/helpers/lostItemKind';
import { LostItemKindEnum } from '@app/services/lostAndFound/types';

/** Nomeia a ação no cartão e intitula o diálogo que a confirma — a mesma frase nos dois. */
export const RESOLVE_LABEL: Readonly<Record<LostItemKindEnum, string>> = {
  [LostItemKindEnum.LOST]: 'Marcar como encontrado',
  [LostItemKindEnum.FOUND]: 'Marcar como devolvido',
};

/** Fecha a frase que o prefixo abre, depois do nome do item. */
const RESOLVE_SUFFIX: Readonly<Record<LostItemKindEnum, string>> = {
  [LostItemKindEnum.LOST]: ' como encontrado?',
  [LostItemKindEnum.FOUND]: ' como devolvido?',
};

// Tipo que a API inventar não tem par de rótulo: a copy cai no nome da situação,
// que serve a qualquer um deles.
const GENERIC_RESOLVE_LABEL = 'Marcar como resolvido';
const GENERIC_RESOLVE_SUFFIX = ' como resolvido?';

export const RESTORE_LABEL = 'Restaurar';

export const RESOLVE_DIALOG = {
  messagePrefix: 'Tem certeza que deseja marcar o item ',
  confirmLabel: 'Confirmar',
};

export function lostItemResolveLabel(kind: string): string {
  if (!isLostItemKind(kind)) return GENERIC_RESOLVE_LABEL;

  return RESOLVE_LABEL[kind];
}

export function lostItemResolveSuffix(kind: string): string {
  if (!isLostItemKind(kind)) return GENERIC_RESOLVE_SUFFIX;

  return RESOLVE_SUFFIX[kind];
}
