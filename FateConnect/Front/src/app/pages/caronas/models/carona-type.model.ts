/** Canonical values aligned with .NET `EnumTipoCarona` and JSON string serialization. */
export type CaronaType = 'Filantropica' | 'Igualitaria';

/** Lowercase normalized input → canonical enum value. */
const LOWERCASE_TO_CARONA_TYPE: Readonly<Record<string, CaronaType>> = {
  filantropica: 'Filantropica',
  igualitaria: 'Igualitaria',
};

/** Parses API responses (PascalCase) or lowercase query values. */
export function parseCaronaType(raw: string | null | undefined): CaronaType | null {
  if (!raw) return null;

  const normalizedLowercase = raw.trim().toLowerCase();
  return LOWERCASE_TO_CARONA_TYPE[normalizedLowercase] ?? null;
}

export function caronaTypeTagClass(value: string): string {
  const canonicalType = parseCaronaType(value);
  if (!canonicalType) return 'tag';

  return canonicalType === 'Filantropica' ? 'tag verde' : 'tag marrom';
}

export function caronaTypeDisplayLabel(value: string): string {
  const canonicalType = parseCaronaType(value);
  if (!canonicalType) return value.trim() || '—';

  return canonicalType === 'Filantropica' ? 'Filantrópica' : 'Igualitária';
}
