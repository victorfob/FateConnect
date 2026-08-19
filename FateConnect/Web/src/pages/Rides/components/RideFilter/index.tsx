import { useCallback, useRef, useState } from 'react';
import type { ChangeEvent, SubmitEvent } from 'react';

import type { RideFilter as RideFilterValues, RideType } from '@app/services/rides/types';
import {
  Button,
  DatePicker,
  FilterAltIcon,
  IconButton,
  InfoIcon,
  InputAdornment,
  MenuItem,
  ScheduleIcon,
  SearchIcon,
  TextField,
  Tooltip,
  Typography,
} from '@design-system';

import {
  FILTER_LABELS,
  FILTER_PANEL_TITLE,
  FILTER_PLACEHOLDERS,
  FILTER_SUBMIT_LABEL,
  RIDE_TYPE_HELP,
  RIDE_TYPE_OPTIONS,
  RideTypeFilter,
  TIME_PICKER_LABEL,
} from './constants';
import { toApiDate } from './helpers/toApiDate';
import * as S from './styles';

type RideFilterProps = Readonly<{ onApply: (filters: RideFilterValues) => void }>;

export function RideFilter({ onApply }: RideFilterProps) {
  const [departureDate, setDepartureDate] = useState<Date | null>(null);
  const [departureTime, setDepartureTime] = useState('');
  const [destination, setDestination] = useState('');
  const [rideType, setRideType] = useState<string>(RideTypeFilter.ALL);
  const timeInputRef = useRef<HTMLInputElement>(null);

  const handleOpenTimePicker = useCallback(() => timeInputRef.current?.showPicker(), []);
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
      if (rideType) filters.rideType = rideType as RideType;

      onApply(filters);
    },
    [departureDate, departureTime, destination, rideType, onApply],
  );

  return (
    <S.FilterPanel defaultExpanded disableGutters>
      <S.FilterHeader>
        <FilterAltIcon />
        <Typography variant="subtitleBold" color="inherit">
          {FILTER_PANEL_TITLE}
        </Typography>
      </S.FilterHeader>

      <S.FilterBody>
        <S.FilterForm component="form" onSubmit={handleSubmit}>
          <S.FieldsRow>
            <S.FieldCell>
              <DatePicker
                label={
                  <S.FieldLabel component="span">
                    <Typography variant="subtitleBold" color="inherit">
                      {FILTER_LABELS.departureDate}
                    </Typography>
                  </S.FieldLabel>
                }
                value={departureDate}
                onChange={setDepartureDate}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </S.FieldCell>

            <S.FieldCell>
              <TextField
                label={
                  <S.FieldLabel component="span">
                    <Typography variant="subtitleBold" color="inherit">
                      {FILTER_LABELS.departureTime}
                    </Typography>
                  </S.FieldLabel>
                }
                type="time"
                fullWidth
                value={departureTime}
                onChange={handleTimeChange}
                inputRef={timeInputRef}
                slotProps={{
                  inputLabel: { shrink: true },
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          type="button"
                          aria-label={TIME_PICKER_LABEL}
                          onClick={handleOpenTimePicker}
                        >
                          <ScheduleIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </S.FieldCell>

            <S.FieldCell>
              <TextField
                label={
                  <S.FieldLabel component="span">
                    <Typography variant="subtitleBold" color="inherit">
                      {FILTER_LABELS.destination}
                    </Typography>
                  </S.FieldLabel>
                }
                fullWidth
                placeholder={FILTER_PLACEHOLDERS.destination}
                value={destination}
                onChange={handleDestinationChange}
              />
            </S.FieldCell>

            <S.FieldCell>
              <TextField
                select
                label={
                  <S.FieldLabel component="span">
                    <Typography variant="subtitleBold" color="inherit">
                      {FILTER_LABELS.rideType}
                    </Typography>
                    <Tooltip title={RIDE_TYPE_HELP}>
                      <InfoIcon fontSize="small" />
                    </Tooltip>
                  </S.FieldLabel>
                }
                fullWidth
                value={rideType}
                onChange={handleRideTypeChange}
                slotProps={{ select: { displayEmpty: true }, inputLabel: { shrink: true } }}
              >
                {RIDE_TYPE_OPTIONS.map(({ value, label }) => (
                  <MenuItem key={label} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>
            </S.FieldCell>

            <S.SubmitCell>
              <Button type="submit" variant="contained" color="error" fullWidth>
                <SearchIcon fontSize="small" />
                <Typography variant="subtitleBold" color="inherit">
                  {FILTER_SUBMIT_LABEL}
                </Typography>
              </Button>
            </S.SubmitCell>
          </S.FieldsRow>
        </S.FilterForm>
      </S.FilterBody>
    </S.FilterPanel>
  );
}
