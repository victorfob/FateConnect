import type { StatusTagTone } from '@design-system';

import { LostItemStatusEnum } from '@app/services/lostAndFound/types';

const STATUS_LABEL: Readonly<Record<LostItemStatusEnum, string>> = {
  [LostItemStatusEnum.OPEN]: 'Aberto',
  [LostItemStatusEnum.RESOLVED]: 'Resolvido',
  [LostItemStatusEnum.CANCELLED]: 'Cancelado',
};

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

/** Interpreta o valor canônico e o da URL, que é o mesmo em minúsculo. */
export function parseLostItemStatus(raw: string | null | undefined): LostItemStatusEnum | null {
  if (!raw) return null;

  const found = Object.values(LostItemStatusEnum).find(
    (status) => status.toLowerCase() === raw.trim().toLowerCase(),
  );

  return found ?? null;
}

export function lostItemStatusSlug(value: LostItemStatusEnum): string {
  return value.toLowerCase();
}

/**
 * A situação vem da API, então o tipo aceita a ausência dela: o rótulo de
 * desconhecido existe para esse caso, e chamar `trim` antes de checar derrubava
 * a tela inteira em vez de exibi-lo.
 */
export function lostItemStatusLabel(value: string | null | undefined): string {
  if (!value) return UNKNOWN_LABEL;
  if (!isLostItemStatus(value)) return value.trim() || UNKNOWN_LABEL;

  return STATUS_LABEL[value];
}

export function lostItemStatusTone(value: string | null | undefined): StatusTagTone {
  if (!value || !isLostItemStatus(value)) return 'neutral';

  return STATUS_TONE[value];
}
