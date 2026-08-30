import { useCallback, useState } from 'react';
import { NavLink } from 'react-router';
import { CardsList, PageShell, Pagination } from '@design-system';
import { AddIcon, ArrowBackIcon, SearchIcon } from '@design-system/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useNotification } from '@app/hooks/useNotification';
import { usePagedSearch } from '@app/hooks/usePagedSearch';
import { RoutePathEnum } from '@app/routes/paths';
import { deleteRide, listRides } from '@app/services/rides/ridesService';
import type { Ride } from '@app/services/rides/types';

import { RideCard } from './components/RideCard';
import { RideFilter } from './components/RideFilter';
import { RideFormDialog } from './components/RideFormDialog';
import { rideSearchCodec } from './helpers/searchQuery';
import * as C from './constants';

const NO_ITEMS = 0;

export function Rides() {
  const queryClient = useQueryClient();
  const { notifySuccess } = useNotification();
  const [editingRide, setEditingRide] = useState<Ride | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const {
    filters,
    items: rides,
    totalPages,
    currentPage,
    isPending,
    applyFilters,
    changePage,
  } = usePagedSearch({
    codec: rideSearchCodec,
    queryKey: C.RIDES_QUERY_KEY,
    listFunction: listRides,
    errorMessage: C.RIDE_LIST_MESSAGES.loadFailed,
  });

  const { mutate: removeRide, isPending: isRemoving } = useMutation({
    mutationFn: (ride: Ride) => deleteRide(ride.id),
    onSuccess: async () => {
      notifySuccess(C.RIDE_LIST_MESSAGES.cancelSucceeded);
      await queryClient.invalidateQueries({ queryKey: [C.RIDES_QUERY_KEY] });
    },
    meta: { errorMessage: C.RIDE_LIST_MESSAGES.cancelFailed },
  });

  const handleCancel = useCallback((ride: Ride) => removeRide(ride), [removeRide]);

  const handleOffer = useCallback(() => {
    setEditingRide(undefined);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((ride: Ride) => {
    setEditingRide(ride);
    setIsFormOpen(true);
  }, []);

  // A carona fica onde está enquanto o diálogo se fecha: zerar agora trocaria o
  // título para o de ofertar bem na frente de quem está vendo a saída.
  const handleCloseForm = useCallback(() => setIsFormOpen(false), []);

  const isLoading = isPending || isRemoving;
  // A aba só acende quando foi ela que abriu o diálogo — editar vem do cartão.
  const isOffering = isFormOpen && !editingRide;

  return (
    <PageShell
      title={C.RIDES_TITLE}
      action={
        <PageShell.Back
          label={C.BACK_LABEL}
          icon={<ArrowBackIcon fontSize="small" />}
          component={NavLink}
          to={RoutePathEnum.MENU}
        />
      }
      tabs={
        <>
          <PageShell.Tab
            label={C.SEARCH_TAB_LABEL}
            icon={<SearchIcon fontSize="small" />}
            selected={!isOffering}
          />
          <PageShell.Tab
            label={C.OFFER_TAB_LABEL}
            icon={<AddIcon fontSize="small" />}
            selected={isOffering}
            onClick={handleOffer}
          />
        </>
      }
    >
      <RideFilter initialFilters={filters} onApply={applyFilters} />

      <CardsList
        isLoading={isLoading}
        isEmpty={rides.length === NO_ITEMS}
        emptyMessage={C.EMPTY_LIST_MESSAGE}
        pagination={<Pagination count={totalPages} page={currentPage} onChange={changePage} />}
      >
        {rides.map((ride) => (
          <RideCard key={ride.id} ride={ride} onEdit={handleEdit} onCancel={handleCancel} />
        ))}
      </CardsList>

      <RideFormDialog open={isFormOpen} onClose={handleCloseForm} ride={editingRide} />
    </PageShell>
  );
}
