import { RideType } from '@app/services/rides/types';
import type { StatusTagTone } from '@design-system';

const LOWERCASE_TO_RIDE_TYPE: Readonly<Record<string, RideType>> = {
  filantropica: RideType.PHILANTHROPIC,
  igualitaria: RideType.EGALITARIAN,
};

const RIDE_TYPE_LABEL: Readonly<Record<RideType, string>> = {
  [RideType.PHILANTHROPIC]: 'Filantrópica',
  [RideType.EGALITARIAN]: 'Igualitária',
};

const RIDE_TYPE_TONE: Readonly<Record<RideType, StatusTagTone>> = {
  [RideType.PHILANTHROPIC]: 'success',
  [RideType.EGALITARIAN]: 'warning',
};

const UNKNOWN_LABEL = '—';

/** Interpreta o valor da API (PascalCase) ou de query em minúsculas. */
export function parseRideType(raw: string | null | undefined): RideType | null {
  if (!raw) return null;

  return LOWERCASE_TO_RIDE_TYPE[raw.trim().toLowerCase()] ?? null;
}

/** Tom da etiqueta do tipo de carona; a cor sai da paleta, nos dois temas. */
export function rideTypeTone(value: string): StatusTagTone {
  const rideType = parseRideType(value);
  if (!rideType) return 'neutral';

  return RIDE_TYPE_TONE[rideType];
}

/** Rótulo em pt-BR; valor desconhecido cai no próprio texto, ou num travessão. */
export function rideTypeDisplayLabel(value: string): string {
  const rideType = parseRideType(value);
  if (!rideType) return value.trim() || UNKNOWN_LABEL;

  return RIDE_TYPE_LABEL[rideType];
}
