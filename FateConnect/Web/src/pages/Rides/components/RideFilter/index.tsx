import { useCallback, useState } from 'react';
import type { ChangeEvent, SubmitEvent } from 'react';

import type { RideFilter as RideFilterValues, RideTypeEnum } from '@app/services/rides/types';
import { Button, Input, Typography } from '@design-system';
import { FilterAltIcon, SearchIcon } from '@design-system/icons';

import * as C from './constants';
import { toApiDate } from '../../helpers/apiDate';
import * as S from './styles';

type RideFilterProps = Readonly<{ onApply: (filters: RideFilterValues) => void }>;

export function RideFilter({ onApply }: RideFilterProps) {
  const [departureDate, setDepartureDate] = useState<Date | null>(null);
  const [departureTime, setDepartureTime] = useState('');
  const [destination, setDestination] = useState('');
  const [rideType, setRideType] = useState<string>(C.RideTypeFilterEnum.ALL);

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

  const handleSubmit = useCallback(
    (event: SubmitEvent<HTMLElement>) => {
      event.preventDefault();

      const filters: RideFilterValues = {};

      if (departureDate) filters.departureDate = toApiDate(departureDate);
      if (departureTime) filters.departureTime = departureTime;
      if (destination.trim()) filters.destination = destination.trim();
      if (rideType) filters.rideType = rideType as RideTypeEnum;

      onApply(filters);
    },
    [departureDate, departureTime, destination, rideType, onApply],
  );

  return (
    <S.FilterPanel defaultExpanded disableGutters>
      <S.FilterHeader>
        <FilterAltIcon />
        <Typography variant="subtitleBold" color="inherit">
          {C.FILTER_PANEL_TITLE}
        </Typography>
      </S.FilterHeader>

      <S.FilterBody>
        <S.FilterForm component="form" onSubmit={handleSubmit}>
          <S.FieldsRow>
            <S.FieldCell>
              <Input.Date
                label={C.FILTER_LABELS.departureDate}
                value={departureDate}
                onChange={setDepartureDate}
              />
            </S.FieldCell>

            <S.FieldCell>
              <Input
                label={C.FILTER_LABELS.departureTime}
                type="time"
                fullWidth
                value={departureTime}
                onChange={handleTimeChange}
              />
            </S.FieldCell>

            <S.FieldCell>
              <Input
                label={C.FILTER_LABELS.destination}
                fullWidth
                placeholder={C.FILTER_PLACEHOLDERS.destination}
                value={destination}
                onChange={handleDestinationChange}
              />
            </S.FieldCell>

            <S.FieldCell>
              <Input.Select
                label={
                  <Input.HelpLabel helpText={C.RIDE_TYPE_HELP}>
                    {C.FILTER_LABELS.rideType}
                  </Input.HelpLabel>
                }
                options={C.RIDE_TYPE_OPTIONS}
                value={rideType}
                onChange={handleRideTypeChange}
              />
            </S.FieldCell>

            <S.SubmitCell>
              <Button type="submit" variant="contained" color="error" fullWidth>
                <SearchIcon fontSize="small" />
                <Typography variant="subtitleBold" color="inherit">
                  {C.FILTER_SUBMIT_LABEL}
                </Typography>
              </Button>
            </S.SubmitCell>
          </S.FieldsRow>
        </S.FilterForm>
      </S.FilterBody>
    </S.FilterPanel>
  );
}
