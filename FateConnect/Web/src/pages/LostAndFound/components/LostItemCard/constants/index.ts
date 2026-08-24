import { CancellationReasonEnum } from '@app/services/lostAndFound/types';

/** A faixa na borda não fala com leitor de tela; este texto é quem conta. */
export const OWN_ITEM_LABEL = 'Meu item';

export function photoAlt(itemName: string): string {
  return `Foto de ${itemName}`;
}

/** Quem cadastrou desistiu ou o mural expirou o item: são coisas diferentes. */
const CANCELLATION_NOTE: Readonly<Record<CancellationReasonEnum, string>> = {
  [CancellationReasonEnum.OWNER]: 'Cancelado por quem cadastrou.',
  [CancellationReasonEnum.INACTIVITY]: 'Cancelado por inatividade.',
};

const UNKNOWN_CANCELLATION_NOTE = 'Cancelado.';

export function cancellationNote(reason: CancellationReasonEnum | null): string {
  if (reason === null) return UNKNOWN_CANCELLATION_NOTE;

  return CANCELLATION_NOTE[reason];
}
