import { DeletionReasonEnum } from '@app/services/lostAndFound/types';

/** A faixa na borda não fala com leitor de tela; este texto é quem conta. */
export const OWN_ITEM_LABEL = 'Meu item';

export function photoAlt(itemName: string): string {
  return `Foto de ${itemName}`;
}

const CANCELLATION_NOTE: Readonly<Record<DeletionReasonEnum, string>> = {
  [DeletionReasonEnum.USER]: 'Cancelado por quem cadastrou.',
  [DeletionReasonEnum.INACTIVITY]: 'Cancelado por inatividade.',
};

const UNKNOWN_CANCELLATION_NOTE = 'Cancelado.';

export function cancellationNote(reason: DeletionReasonEnum | null): string {
  if (reason === null) return UNKNOWN_CANCELLATION_NOTE;

  return CANCELLATION_NOTE[reason];
}
