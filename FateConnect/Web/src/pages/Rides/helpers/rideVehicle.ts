import { VehicleTypeEnum } from '@app/services/rides/types';

const LOWERCASE_TO_VEHICLE_TYPE: Readonly<Record<string, VehicleTypeEnum>> = {
  car: VehicleTypeEnum.CAR,
  motorcycle: VehicleTypeEnum.MOTORCYCLE,
  carro: VehicleTypeEnum.CAR,
  moto: VehicleTypeEnum.MOTORCYCLE,
};

const VEHICLE_TYPE_SLUG: Readonly<Record<VehicleTypeEnum, string>> = {
  [VehicleTypeEnum.CAR]: 'carro',
  [VehicleTypeEnum.MOTORCYCLE]: 'moto',
};

const VEHICLE_TYPE_LABEL: Readonly<Record<VehicleTypeEnum, string>> = {
  [VehicleTypeEnum.CAR]: 'Carro',
  [VehicleTypeEnum.MOTORCYCLE]: 'Moto',
};

const VEHICLE_TYPE_VALUES: ReadonlySet<string> = new Set(Object.values(VehicleTypeEnum));

/** Escolhas de veículo, servindo o filtro e o formulário de carona. */
export const VEHICLE_TYPE_OPTIONS: readonly { value: VehicleTypeEnum; label: string }[] = [
  { value: VehicleTypeEnum.CAR, label: VEHICLE_TYPE_LABEL[VehicleTypeEnum.CAR] },
  { value: VehicleTypeEnum.MOTORCYCLE, label: VEHICLE_TYPE_LABEL[VehicleTypeEnum.MOTORCYCLE] },
];

export function isVehicleType(value: string): value is VehicleTypeEnum {
  return VEHICLE_TYPE_VALUES.has(value);
}

/** Interpreta o valor da API (PascalCase) e o da URL, em pt-BR minúsculo. */
export function parseVehicleType(raw: string | null | undefined): VehicleTypeEnum | null {
  if (!raw) return null;

  return LOWERCASE_TO_VEHICLE_TYPE[raw.trim().toLowerCase()] ?? null;
}

export function vehicleTypeSlug(value: VehicleTypeEnum): string {
  return VEHICLE_TYPE_SLUG[value];
}

export function vehicleTypeLabel(value: VehicleTypeEnum): string {
  return VEHICLE_TYPE_LABEL[value];
}
