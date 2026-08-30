import { useCallback, useState, type ChangeEvent } from 'react';
import { FilterPanel, Input } from '@design-system';

import type { RideFilter as RideFilterValues, RideTypeEnum } from '@app/services/rides/types';
import { fromFormDate, toApiDate } from '@app/utils/apiDate';

import * as C from './constants';

/** Células por linha no desktop: quatro campos e o botão cabem em uma. */
const FILTER_COLUMNS = 5;
const NO_FILTERS = 0;

/** Paginação não conta: o ponto ao lado do título é sobre escolha de busca. */
function hasAnyFilter({
  destination,
  departureDate,
  departureTime,
  rideType,
}: RideFilterValues): boolean {
  return Boolean(destination || departureDate || departureTime || rideType);
}

type RideFilterProps = Readonly<{
  initialFilters: RideFilterValues;
  onApply: (filters: RideFilterValues) => void;
}>;

export function RideFilter({ initialFilters, onApply }: RideFilterProps) {
  const [departureDate, setDepartureDate] = useState<Date | null>(() =>
    fromFormDate(initialFilters.departureDate ?? ''),
  );
  const [departureTime, setDepartureTime] = useState(initialFilters.departureTime ?? '');
  const [destination, setDestination] = useState(initialFilters.destination ?? '');
  const [rideType, setRideType] = useState<string>(
    initialFilters.rideType ?? C.RideTypeFilterEnum.ALL,
  );
  const [isFiltered, setIsFiltered] = useState(() => hasAnyFilter(initialFilters));

  const handleTimeChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setDepartureTime(event.target.value),
    [],
  );
  const handleDestinationChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setDestination(event.target.value),
    [],
  );
  const handleRideTypeChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setRideType(event.target.value),
    [],
  );

  const handleSubmit = useCallback(() => {
    const filters: RideFilterValues = {};

    if (departureDate) filters.departureDate = toApiDate(departureDate);
    if (departureTime) filters.departureTime = departureTime;
    if (destination.trim()) filters.destination = destination.trim();
    if (rideType) filters.rideType = rideType as RideTypeEnum;

    setIsFiltered(Object.keys(filters).length > NO_FILTERS);
    onApply(filters);
  }, [departureDate, departureTime, destination, rideType, onApply]);

  return (
    <FilterPanel
      title={C.FILTER_PANEL_TITLE}
      submitLabel={C.FILTER_SUBMIT_LABEL}
      columns={FILTER_COLUMNS}
      active={isFiltered}
      onSubmit={handleSubmit}
    >
      <FilterPanel.Field>
        <Input.Date
          label={C.FILTER_LABELS.departureDate}
          value={departureDate}
          onChange={setDepartureDate}
        />
      </FilterPanel.Field>

      <FilterPanel.Field>
        <Input
          label={C.FILTER_LABELS.departureTime}
          type="time"
          fullWidth
          value={departureTime}
          onChange={handleTimeChange}
        />
      </FilterPanel.Field>

      <FilterPanel.Field>
        <Input
          label={C.FILTER_LABELS.destination}
          fullWidth
          placeholder={C.FILTER_PLACEHOLDERS.destination}
          value={destination}
          onChange={handleDestinationChange}
        />
      </FilterPanel.Field>

      <FilterPanel.Field>
        <Input.Select
          label={
            <Input.HelpLabel helpText={C.RIDE_TYPE_HELP}>
              {C.FILTER_LABELS.rideType}
            </Input.HelpLabel>
          }
          options={C.RIDE_TYPE_FILTER_OPTIONS}
          value={rideType}
          onChange={handleRideTypeChange}
        />
      </FilterPanel.Field>
    </FilterPanel>
  );
}
