import { LostItemKindEnum } from '@app/services/lostAndFound/types';

const KIND_LABEL: Readonly<Record<LostItemKindEnum, string>> = {
  [LostItemKindEnum.FOUND]: 'Achado',
  [LostItemKindEnum.LOST]: 'Perdido',
};

/** O que vai para a URL: o rótulo em minúsculo, como o da situação. */
const KIND_SLUG: Readonly<Record<LostItemKindEnum, string>> = {
  [LostItemKindEnum.FOUND]: 'achado',
  [LostItemKindEnum.LOST]: 'perdido',
};

const KIND_VALUES: ReadonlySet<string> = new Set(Object.values(LostItemKindEnum));

/** Uma fonte só, servindo o filtro e o cadastro. */
export const LOST_ITEM_KIND_OPTIONS: readonly { value: LostItemKindEnum; label: string }[] = [
  { value: LostItemKindEnum.FOUND, label: KIND_LABEL[LostItemKindEnum.FOUND] },
  { value: LostItemKindEnum.LOST, label: KIND_LABEL[LostItemKindEnum.LOST] },
];

export function isLostItemKind(value: string): value is LostItemKindEnum {
  return KIND_VALUES.has(value);
}

export function lostItemKindSlug(value: LostItemKindEnum): string {
  return KIND_SLUG[value];
}

/** Interpreta o que a URL escreve, que é o rótulo em minúsculo. */
export function parseLostItemKind(raw: string | null | undefined): LostItemKindEnum | null {
  if (!raw) return null;

  const slug = raw.trim().toLowerCase();
  const found = Object.values(LostItemKindEnum).find((kind) => KIND_SLUG[kind] === slug);

  return found ?? null;
}

/** Rótulo em pt-BR; valor que a API inventar cai no próprio texto. */
export function lostItemKindLabel(value: string): string {
  if (!isLostItemKind(value)) return value;

  return KIND_LABEL[value];
}
