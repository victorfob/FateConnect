import { RideShiftEnum } from '@app/services/rides/types';

/** A faixa entra no rótulo: sem ela cada um imagina um horário para o turno. */
const SHIFT_LABEL: Readonly<Record<RideShiftEnum, string>> = {
  [RideShiftEnum.MORNING]: 'Manhã (04:00 - 11:59)',
  [RideShiftEnum.AFTERNOON]: 'Tarde (12:00 - 17:59)',
  [RideShiftEnum.NIGHT]: 'Noite (18:00 - 03:59)',
};

/** O que vai para a URL: o nome do turno sem acento, porque o endereço se lê. */
const SHIFT_SLUG: Readonly<Record<RideShiftEnum, string>> = {
  [RideShiftEnum.MORNING]: 'manha',
  [RideShiftEnum.AFTERNOON]: 'tarde',
  [RideShiftEnum.NIGHT]: 'noite',
};

const SHIFT_VALUES: ReadonlySet<string> = new Set(Object.values(RideShiftEnum));

export const RIDE_SHIFT_OPTIONS: readonly { value: RideShiftEnum; label: string }[] = [
  { value: RideShiftEnum.MORNING, label: SHIFT_LABEL[RideShiftEnum.MORNING] },
  { value: RideShiftEnum.AFTERNOON, label: SHIFT_LABEL[RideShiftEnum.AFTERNOON] },
  { value: RideShiftEnum.NIGHT, label: SHIFT_LABEL[RideShiftEnum.NIGHT] },
];

/** Estreita o texto que o campo guarda para o turno que a API recebe. */
export function isRideShift(value: string): value is RideShiftEnum {
  return SHIFT_VALUES.has(value);
}

export function rideShiftSlug(value: RideShiftEnum): string {
  return SHIFT_SLUG[value];
}

/** Interpreta o que a URL escreve, que é o nome do turno sem acento. */
export function parseRideShift(raw: string | null | undefined): RideShiftEnum | null {
  if (!raw) return null;

  const slug = raw.trim().toLowerCase();
  const found = Object.values(RideShiftEnum).find((shift) => SHIFT_SLUG[shift] === slug);

  return found ?? null;
}
