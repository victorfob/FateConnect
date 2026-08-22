import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import { useNotification } from '@app/hooks/useNotification';
import { deleteRide, listRides } from '@app/services/rides/ridesService';
import type { Ride, RideFilter as RideFilterValues } from '@app/services/rides/types';
import { CircularProgress, Typography } from '@design-system';

import { RideCard } from '../../components/RideCard';
import { RideFilter } from '../../components/RideFilter';
import { RideFormDialog } from '../../components/RideFormDialog';
import { EMPTY_LIST_MESSAGE, RIDE_LIST_MESSAGES, RIDES_QUERY_KEY } from '../../constants';
import * as S from './styles';

const SPINNER_SIZE_PX = 60;

export function SearchRide() {
  const queryClient = useQueryClient();
  const { notifySuccess } = useNotification();
  const [filters, setFilters] = useState<RideFilterValues>({});
  const [editingRide, setEditingRide] = useState<Ride | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);

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
  const handleDelete = useCallback((ride: Ride) => removeRide(ride), [removeRide]);

  const handleEdit = useCallback((ride: Ride) => {
    setEditingRide(ride);
    setIsEditing(true);
  }, []);

  // A carona fica onde está enquanto o diálogo se fecha: zerar agora trocaria o
  // título para o de ofertar bem na frente de quem está vendo a saída.
  const handleCloseEdit = useCallback(() => setIsEditing(false), []);

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

      <RideFormDialog open={isEditing} onClose={handleCloseEdit} ride={editingRide} />
    </>
  );
}
