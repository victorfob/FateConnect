import { DeletionReasonEnum } from '@app/services/lostAndFound/types';

/** A faixa na borda não fala com leitor de tela; este texto é quem conta. */
export const OWN_ITEM_LABEL = 'Meu item';

export function photoAlt(itemName: string): string {
  return `Foto de ${itemName}`;
}

/** O advérbio é quem separa o par: sem ele, "por" seria agente num e causa no outro. */
const DELETION_NOTE: Readonly<Record<DeletionReasonEnum, string>> = {
  [DeletionReasonEnum.USER]: 'Excluído manualmente.',
  [DeletionReasonEnum.INACTIVITY]: 'Excluído automaticamente por inatividade.',
};

/** Sem motivo não há nota: a etiqueta do cartão já diz que o item foi excluído. */
export function deletionNote(reason: DeletionReasonEnum | null): string | null {
  if (reason === null) return null;

  return DELETION_NOTE[reason];
}
