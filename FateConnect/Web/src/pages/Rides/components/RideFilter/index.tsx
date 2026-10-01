import { useCallback, useState, type ChangeEvent } from 'react';
import { FilterDialog, Input } from '@design-system';

import { isRideShift } from '@app/pages/Rides/helpers/rideShift';
import { isRideType, RIDE_TYPE_HELP } from '@app/pages/Rides/helpers/rideType';
import { isVehicleType } from '@app/pages/Rides/helpers/rideVehicle';
import type { RideFilter as RideFilterValues } from '@app/services/rides/types';
import { toApiDateRange, toDisplayDateRange } from '@app/utils/apiDate';

import * as C from './constants';

/** Paginação não conta: o ponto ao lado do título é sobre escolha de busca. */
function hasAnyFilter({
  searchTerm,
  dateFrom,
  dateTo,
  departureShift,
  rideType,
  vehicleType,
  onlyMine,
}: RideFilterValues): boolean {
  return Boolean(
    searchTerm || dateFrom || dateTo || departureShift || rideType || vehicleType || onlyMine,
  );
}

type RideFilterProps = Readonly<{
  initialFilters: RideFilterValues;
  onApply: (filters: RideFilterValues) => void;
}>;

export function RideFilter({ initialFilters, onApply }: RideFilterProps) {
  const [period, setPeriod] = useState(() =>
    toDisplayDateRange(initialFilters.dateFrom, initialFilters.dateTo),
  );
  const [departureShift, setDepartureShift] = useState<string>(
    initialFilters.departureShift ?? C.RideShiftFilterEnum.ALL,
  );
  const [searchTerm, setSearchTerm] = useState(initialFilters.searchTerm ?? '');
  const [rideType, setRideType] = useState<string>(
    initialFilters.rideType ?? C.RideTypeFilterEnum.ALL,
  );
  const [vehicleType, setVehicleType] = useState<string>(
    initialFilters.vehicleType ?? C.VehicleTypeFilterEnum.ALL,
  );
  const [owner, setOwner] = useState<string>(() => {
    if (initialFilters.onlyMine) return C.RideOwnerFilterEnum.MINE;

    return C.RideOwnerFilterEnum.ALL;
  });
  const [isFiltered, setIsFiltered] = useState(() => hasAnyFilter(initialFilters));

  const handleShiftChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setDepartureShift(event.target.value),
    [],
  );
  const handleSearchTermChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setSearchTerm(event.target.value),
    [],
  );
  const handleRideTypeChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setRideType(event.target.value),
    [],
  );
  const handleVehicleTypeChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setVehicleType(event.target.value),
    [],
  );
  const handleOwnerChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setOwner(event.target.value),
    [],
  );

  /** A busca abre sem filtro nenhum, então limpar é devolver os campos ao vazio. */
  const handleClear = useCallback(() => {
    setPeriod('');
    setDepartureShift(C.RideShiftFilterEnum.ALL);
    setSearchTerm('');
    setRideType(C.RideTypeFilterEnum.ALL);
    setVehicleType(C.VehicleTypeFilterEnum.ALL);
    setOwner(C.RideOwnerFilterEnum.ALL);
    setIsFiltered(false);
    onApply({});
  }, [onApply]);

  const handleSubmit = useCallback(() => {
    const filters: RideFilterValues = {};
    const { dateFrom, dateTo } = toApiDateRange(period);

    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;
    if (isRideShift(departureShift)) filters.departureShift = departureShift;
    if (searchTerm.trim()) filters.searchTerm = searchTerm.trim();
    if (isRideType(rideType)) filters.rideType = rideType;
    if (isVehicleType(vehicleType)) filters.vehicleType = vehicleType;
    if (owner === C.RideOwnerFilterEnum.MINE) filters.onlyMine = true;

    setIsFiltered(hasAnyFilter(filters));
    onApply(filters);
  }, [period, departureShift, searchTerm, rideType, vehicleType, owner, onApply]);

  return (
    <FilterDialog active={isFiltered} onSubmit={handleSubmit} onClear={handleClear}>
      <FilterDialog.Field>
        <Input.DateRange label={C.FILTER_LABELS.period} value={period} onChange={setPeriod} />
      </FilterDialog.Field>

      <FilterDialog.Field>
        <Input.Select
          label={C.FILTER_LABELS.departureShift}
          options={C.RIDE_SHIFT_FILTER_OPTIONS}
          value={departureShift}
          onChange={handleShiftChange}
        />
      </FilterDialog.Field>

      <FilterDialog.Field>
        <Input
          label={C.FILTER_LABELS.searchTerm}
          fullWidth
          placeholder={C.FILTER_PLACEHOLDERS.searchTerm}
          value={searchTerm}
          onChange={handleSearchTermChange}
        />
      </FilterDialog.Field>

      <FilterDialog.Field>
        <Input.Select
          label={C.FILTER_LABELS.rideType}
          helpText={RIDE_TYPE_HELP}
          options={C.RIDE_TYPE_FILTER_OPTIONS}
          value={rideType}
          onChange={handleRideTypeChange}
        />
      </FilterDialog.Field>

      <FilterDialog.Field>
        <Input.Select
          label={C.FILTER_LABELS.vehicleType}
          options={C.VEHICLE_TYPE_FILTER_OPTIONS}
          value={vehicleType}
          onChange={handleVehicleTypeChange}
        />
      </FilterDialog.Field>

      <FilterDialog.Field>
        <Input.Select
          label={C.FILTER_LABELS.owner}
          options={C.RIDE_OWNER_FILTER_OPTIONS}
          value={owner}
          onChange={handleOwnerChange}
        />
      </FilterDialog.Field>
    </FilterDialog>
  );
}
