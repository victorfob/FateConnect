import { LostItemKindEnum } from '@app/services/lostAndFound/types';

const KIND_VALUES: ReadonlySet<string> = new Set(Object.values(LostItemKindEnum));

/**
 * Uma fonte só, servindo o filtro e o cadastro; o valor canônico já é o rótulo.
 */
export const LOST_ITEM_KIND_OPTIONS: readonly { value: LostItemKindEnum; label: string }[] = [
  { value: LostItemKindEnum.FOUND, label: LostItemKindEnum.FOUND },
  { value: LostItemKindEnum.LOST, label: LostItemKindEnum.LOST },
];

export function isLostItemKind(value: string): value is LostItemKindEnum {
  return KIND_VALUES.has(value);
}
