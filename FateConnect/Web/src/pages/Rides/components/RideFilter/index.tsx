import { useCallback, useState, type ChangeEvent } from 'react';
import { FilterDialog, Input } from '@design-system';

import type { RideFilter as RideFilterValues, RideTypeEnum } from '@app/services/rides/types';
import { toApiDateText, toDisplayDate } from '@app/utils/apiDate';

import * as C from './constants';

const NO_FILTERS = 0;

/** Paginação não conta: o ponto ao lado do título é sobre escolha de busca. */
function hasAnyFilter({
  searchTerm,
  departureDate,
  departureTime,
  rideType,
}: RideFilterValues): boolean {
  return Boolean(searchTerm || departureDate || departureTime || rideType);
}

type RideFilterProps = Readonly<{
  initialFilters: RideFilterValues;
  onApply: (filters: RideFilterValues) => void;
}>;

export function RideFilter({ initialFilters, onApply }: RideFilterProps) {
  const [departureDate, setDepartureDate] = useState(() =>
    toDisplayDate(initialFilters.departureDate ?? ''),
  );
  const [departureTime, setDepartureTime] = useState(initialFilters.departureTime ?? '');
  const [searchTerm, setSearchTerm] = useState(initialFilters.searchTerm ?? '');
  const [rideType, setRideType] = useState<string>(
    initialFilters.rideType ?? C.RideTypeFilterEnum.ALL,
  );
  const [isFiltered, setIsFiltered] = useState(() => hasAnyFilter(initialFilters));

  const handleTimeChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setDepartureTime(event.target.value),
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

  /** A busca abre sem filtro nenhum, então limpar é devolver os campos ao vazio. */
  const handleClear = useCallback(() => {
    setDepartureDate('');
    setDepartureTime('');
    setSearchTerm('');
    setRideType(C.RideTypeFilterEnum.ALL);
    setIsFiltered(false);
    onApply({});
  }, [onApply]);

  const handleSubmit = useCallback(() => {
    const filters: RideFilterValues = {};

    if (departureDate) filters.departureDate = toApiDateText(departureDate);
    if (departureTime) filters.departureTime = departureTime;
    if (searchTerm.trim()) filters.searchTerm = searchTerm.trim();
    if (rideType) filters.rideType = rideType as RideTypeEnum;

    setIsFiltered(Object.keys(filters).length > NO_FILTERS);
    onApply(filters);
  }, [departureDate, departureTime, searchTerm, rideType, onApply]);

  return (
    <FilterDialog
      triggerLabel={C.FILTER_TITLE}
      title={C.FILTER_TITLE}
      submitLabel={C.FILTER_SUBMIT_LABEL}
      clearLabel={C.FILTER_CLEAR_LABEL}
      active={isFiltered}
      onSubmit={handleSubmit}
      onClear={handleClear}
    >
      <FilterDialog.Field>
        <Input.Date
          label={C.FILTER_LABELS.departureDate}
          value={departureDate}
          onChange={setDepartureDate}
        />
      </FilterDialog.Field>

      <FilterDialog.Field>
        <Input
          label={C.FILTER_LABELS.departureTime}
          type="time"
          fullWidth
          value={departureTime}
          onChange={handleTimeChange}
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
          helpText={C.RIDE_TYPE_HELP}
          options={C.RIDE_TYPE_FILTER_OPTIONS}
          value={rideType}
          onChange={handleRideTypeChange}
        />
      </FilterDialog.Field>
    </FilterDialog>
  );
}
