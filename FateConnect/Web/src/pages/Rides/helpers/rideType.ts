import type { StatusTagTone } from '@design-system';

import { RideTypeEnum } from '@app/services/rides/types';

const LOWERCASE_TO_RIDE_TYPE: Readonly<Record<string, RideTypeEnum>> = {
  solidarity: RideTypeEnum.SOLIDARITY,
  egalitarian: RideTypeEnum.EGALITARIAN,
};

const RIDE_TYPE_LABEL: Readonly<Record<RideTypeEnum, string>> = {
  [RideTypeEnum.SOLIDARITY]: 'Solidária',
  [RideTypeEnum.EGALITARIAN]: 'Igualitária',
};

const RIDE_TYPE_TONE: Readonly<Record<RideTypeEnum, StatusTagTone>> = {
  [RideTypeEnum.SOLIDARITY]: 'success',
  [RideTypeEnum.EGALITARIAN]: 'warning',
};

const RIDE_TYPE_VALUES: ReadonlySet<string> = new Set(Object.values(RideTypeEnum));

const UNKNOWN_LABEL = '—';

/** Escolhas de tipo — uma fonte só, servindo o filtro e o formulário de carona. */
export const RIDE_TYPE_OPTIONS: readonly { value: RideTypeEnum; label: string }[] = [
  { value: RideTypeEnum.SOLIDARITY, label: RIDE_TYPE_LABEL[RideTypeEnum.SOLIDARITY] },
  { value: RideTypeEnum.EGALITARIAN, label: RIDE_TYPE_LABEL[RideTypeEnum.EGALITARIAN] },
];

/**
 * Estreita o texto que o formulário guarda para o tipo da API. Usado como
 * validação do campo: o zod adota o tipo estreitado na saída do schema.
 */
export function isRideType(value: string): value is RideTypeEnum {
  return RIDE_TYPE_VALUES.has(value);
}

/** Interpreta o valor da API (PascalCase) ou de query em minúsculas. */
export function parseRideType(raw: string | null | undefined): RideTypeEnum | null {
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
