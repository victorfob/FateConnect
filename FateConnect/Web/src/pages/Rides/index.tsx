import { useCallback, useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import { ListCardSkeleton, PageShell, Pagination, Typography } from '@design-system';
import { AddIcon, ArrowBackIcon, SearchIcon } from '@design-system/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useNotification } from '@app/hooks/useNotification';
import { useSearchQuery } from '@app/hooks/useSearchQuery';
import { RoutePathEnum } from '@app/routes/paths';
import { deleteRide, listRides } from '@app/services/rides/ridesService';
import type { Ride, RideFilter as RideFilterValues } from '@app/services/rides/types';

import { RideCard } from './components/RideCard';
import { RideFilter } from './components/RideFilter';
import { RideFormDialog } from './components/RideFormDialog';
import { FIRST_PAGE, PAGE_SIZE, rideSearchCodec } from './helpers/searchQuery';
import * as C from './constants';
import * as S from './styles';

const NO_ITEMS = 0;
const NO_PAGES = 0;

export function Rides() {
  const queryClient = useQueryClient();
  const { notifySuccess } = useNotification();
  const { value: filters, replace: replaceSearch } = useSearchQuery(rideSearchCodec);
  const [editingRide, setEditingRide] = useState<Ride | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: ridePage, isPending } = useQuery({
    queryKey: [C.RIDES_QUERY_KEY, filters],
    queryFn: () => listRides(filters),
    meta: { errorMessage: C.RIDE_LIST_MESSAGES.loadFailed },
  });

  const rides = ridePage?.items ?? [];
  const totalPages = ridePage?.totalPages ?? NO_PAGES;
  const currentPage = filters.page ?? FIRST_PAGE;

  // Quem salvou `?pagina=7` e voltou depois de a lista encolher veria uma página
  // vazia, que parece defeito. Cai na última existente e a URL acompanha.
  useEffect(() => {
    if (totalPages === NO_PAGES || currentPage <= totalPages) return;

    replaceSearch({ ...filters, page: totalPages });
  }, [currentPage, filters, replaceSearch, totalPages]);

  const { mutate: removeRide, isPending: isRemoving } = useMutation({
    mutationFn: (ride: Ride) => deleteRide(ride.id),
    onSuccess: async () => {
      notifySuccess(C.RIDE_LIST_MESSAGES.cancelSucceeded);
      await queryClient.invalidateQueries({ queryKey: [C.RIDES_QUERY_KEY] });
    },
    meta: { errorMessage: C.RIDE_LIST_MESSAGES.cancelFailed },
  });

  // Filtrar refaz a busca, então a página volta a ser a primeira.
  const handleApplyFilters = useCallback(
    (applied: RideFilterValues) =>
      replaceSearch({ ...applied, page: FIRST_PAGE, pageSize: PAGE_SIZE }),
    [replaceSearch],
  );

  const handlePageChange = useCallback(
    (nextPage: number) => replaceSearch({ ...filters, page: nextPage }),
    [filters, replaceSearch],
  );
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
      <RideFilter initialFilters={filters} onApply={handleApplyFilters} />

      <S.RideList>
        {isLoading && <ListCardSkeleton />}

        {!isLoading && rides.length === NO_ITEMS && (
          <Typography variant="subtitle">{C.EMPTY_LIST_MESSAGE}</Typography>
        )}

        {!isLoading &&
          rides.map((ride) => (
            <RideCard key={ride.id} ride={ride} onEdit={handleEdit} onCancel={handleCancel} />
          ))}
      </S.RideList>

      {!isLoading && (
        <S.PaginationRow>
          <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} />
        </S.PaginationRow>
      )}

      <RideFormDialog open={isFormOpen} onClose={handleCloseForm} ride={editingRide} />
    </PageShell>
  );
}
