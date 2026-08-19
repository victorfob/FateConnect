import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import { useNotification } from '@app/hooks/useNotification';
import { deleteRide, listRides } from '@app/services/rides/ridesService';
import type { Ride, RideFilter as RideFilterValues } from '@app/services/rides/types';
import { CircularProgress, Typography } from '@design-system';

import { RideCard } from '../../components/RideCard';
import { RideFilter } from '../../components/RideFilter';
import { EMPTY_LIST_MESSAGE, RIDE_LIST_MESSAGES } from '../../constants';
import * as S from './styles';

const SPINNER_SIZE_PX = 60;
const RIDES_QUERY_KEY = 'rides';

export function SearchRide() {
  const queryClient = useQueryClient();
  const { notifySuccess, notifyWarning } = useNotification();
  const [filters, setFilters] = useState<RideFilterValues>({});

  const { data: rides = [], isPending } = useQuery({
    queryKey: [RIDES_QUERY_KEY, filters],
    queryFn: () => listRides(filters),
    meta: { errorMessage: RIDE_LIST_MESSAGES.loadFailed },
  });

  const { mutate: removeRide, isPending: isRemoving } = useMutation({
    mutationFn: (ride: Ride) => deleteRide(ride.id),
    onSuccess: async () => {
      notifySuccess(RIDE_LIST_MESSAGES.deleteSucceeded);
      await queryClient.invalidateQueries({ queryKey: [RIDES_QUERY_KEY] });
    },
    meta: { errorMessage: RIDE_LIST_MESSAGES.deleteFailed },
  });

  const handleApplyFilters = useCallback((applied: RideFilterValues) => setFilters(applied), []);
  const handleEdit = useCallback(() => notifyWarning(RIDE_LIST_MESSAGES.editSoon), [notifyWarning]);
  const handleDelete = useCallback((ride: Ride) => removeRide(ride), [removeRide]);

  const isLoading = isPending || isRemoving;

  return (
    <>
      <RideFilter onApply={handleApplyFilters} />

      <S.RideList>
        {isLoading && (
          <S.LoadingContainer>
            <CircularProgress size={SPINNER_SIZE_PX} />
          </S.LoadingContainer>
        )}

        {!isLoading && rides.length === 0 && (
          <Typography variant="subtitle">{EMPTY_LIST_MESSAGE}</Typography>
        )}

        {!isLoading &&
          rides.map((ride) => (
            <RideCard key={ride.id} ride={ride} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
      </S.RideList>
    </>
  );
}
