import { isLostItemKind } from '@app/pages/LostAndFound/helpers/lostItemKind';
import { LostItemKindEnum } from '@app/services/lostAndFound/types';

const RESOLVE_LABEL: Readonly<Record<LostItemKindEnum, string>> = {
  [LostItemKindEnum.LOST]: 'Marcar como encontrado',
  [LostItemKindEnum.FOUND]: 'Marcar como devolvido',
};

const GENERIC_RESOLVE_LABEL = 'Resolver';

export const REOPEN_LABEL = 'Reabrir';

export function lostItemResolveLabel(kind: string): string {
  if (!isLostItemKind(kind)) return GENERIC_RESOLVE_LABEL;

  return RESOLVE_LABEL[kind];
}

export const RESOLVE_DIALOG = {
  title: 'Confirmar resolução',
  messagePrefix: 'Tem certeza que deseja resolver o item ',
  confirmLabel: 'Resolver',
};
