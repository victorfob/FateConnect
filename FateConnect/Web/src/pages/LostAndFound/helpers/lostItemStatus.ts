import { LostItemStatusEnum } from '@app/services/lostAndFound/types';
import type { StatusTagTone } from '@design-system';

const STATUS_LABEL: Readonly<Record<LostItemStatusEnum, string>> = {
  [LostItemStatusEnum.OPEN]: 'Aberto',
  [LostItemStatusEnum.RESOLVED]: 'Concluído',
  [LostItemStatusEnum.CANCELLED]: 'Cancelado',
};

/** A #29 previa cinza no aberto; virou amarelo quando a situação passou a ser a única etiqueta do cartão. */
const STATUS_TONE: Readonly<Record<LostItemStatusEnum, StatusTagTone>> = {
  [LostItemStatusEnum.OPEN]: 'warning',
  [LostItemStatusEnum.RESOLVED]: 'success',
  [LostItemStatusEnum.CANCELLED]: 'danger',
};

const STATUS_VALUES: ReadonlySet<string> = new Set(Object.values(LostItemStatusEnum));

const UNKNOWN_LABEL = '—';

export const LOST_ITEM_STATUS_OPTIONS: readonly { value: LostItemStatusEnum; label: string }[] = [
  { value: LostItemStatusEnum.OPEN, label: STATUS_LABEL[LostItemStatusEnum.OPEN] },
  { value: LostItemStatusEnum.RESOLVED, label: STATUS_LABEL[LostItemStatusEnum.RESOLVED] },
  { value: LostItemStatusEnum.CANCELLED, label: STATUS_LABEL[LostItemStatusEnum.CANCELLED] },
];

export function isLostItemStatus(value: string): value is LostItemStatusEnum {
  return STATUS_VALUES.has(value);
}

export function lostItemStatusLabel(value: string): string {
  if (!isLostItemStatus(value)) return value.trim() || UNKNOWN_LABEL;

  return STATUS_LABEL[value];
}

export function lostItemStatusTone(value: string): StatusTagTone {
  if (!isLostItemStatus(value)) return 'neutral';

  return STATUS_TONE[value];
}
