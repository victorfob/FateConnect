const SEQUENCE_START = 0;

export function firstCharacters(value: string, count: number): string {
  return value.slice(SEQUENCE_START, count);
}

export function firstItems<Item>(list: readonly Item[], count: number): Item[] {
  return list.slice(SEQUENCE_START, count);
}
