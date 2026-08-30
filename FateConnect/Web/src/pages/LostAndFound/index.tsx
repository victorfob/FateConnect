import { useCallback, useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import { ListCardSkeleton, PageShell, Pagination, Typography } from '@design-system';
import { AddIcon, ArrowBackIcon, SearchIcon } from '@design-system/icons';
import { useQuery } from '@tanstack/react-query';

import { useSearchQuery } from '@app/hooks/useSearchQuery';
import { RoutePathEnum } from '@app/routes/paths';
import { listLostItems } from '@app/services/lostAndFound/lostAndFoundService';
import type {
  LostItem,
  LostItemFilter as LostItemFilterValues,
} from '@app/services/lostAndFound/types';

import { LostItemCard } from './components/LostItemCard';
import { LostItemFilter } from './components/LostItemFilter';
import { LostItemFormDialog } from './components/LostItemFormDialog';
import { FIRST_PAGE, lostItemSearchCodec, PAGE_SIZE } from './helpers/searchQuery';
import { useLostItemTransitions } from './hooks/useLostItemTransitions';
import * as C from './constants';
import * as S from './styles';

const NO_ITEMS = 0;
const NO_PAGES = 0;

export function LostAndFound() {
  const { value: filters, replace: replaceSearch } = useSearchQuery(lostItemSearchCodec);
  const [editingItem, setEditingItem] = useState<LostItem | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { resolveItem, cancelItem, reopenItem, isTransitioning } = useLostItemTransitions();

  const { data: itemPage, isPending } = useQuery({
    queryKey: [C.LOST_ITEMS_QUERY_KEY, filters],
    queryFn: () => listLostItems(filters),
    meta: { errorMessage: C.LOST_ITEM_LIST_MESSAGES.loadFailed },
  });

  const items = itemPage?.items ?? [];
  const totalPages = itemPage?.totalPages ?? NO_PAGES;
  const currentPage = filters.page ?? FIRST_PAGE;

  // Quem salvou `?pagina=7` e voltou depois de a lista encolher veria uma página
  // vazia, que parece defeito. Cai na última existente e a URL acompanha.
  useEffect(() => {
    if (totalPages === NO_PAGES || currentPage <= totalPages) return;

    replaceSearch({ ...filters, page: totalPages });
  }, [currentPage, filters, replaceSearch, totalPages]);

  // Filtrar refaz a busca, então a página volta a ser a primeira.
  const handleApplyFilters = useCallback(
    (applied: LostItemFilterValues) =>
      replaceSearch({ ...applied, page: FIRST_PAGE, pageSize: PAGE_SIZE }),
    [replaceSearch],
  );

  const handlePageChange = useCallback(
    (nextPage: number) => replaceSearch({ ...filters, page: nextPage }),
    [filters, replaceSearch],
  );

  const handleRegister = useCallback(() => {
    setEditingItem(undefined);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((item: LostItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  }, []);

  // O item fica até o diálogo fechar: zerar agora trocaria o título na frente de quem olha.
  const handleCloseForm = useCallback(() => setIsFormOpen(false), []);

  const isRegistering = isFormOpen && !editingItem;
  const isLoading = isPending || isTransitioning;

  return (
    <PageShell
      title={C.LOST_AND_FOUND_TITLE}
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
            selected={!isRegistering}
          />
          <PageShell.Tab
            label={C.REGISTER_TAB_LABEL}
            icon={<AddIcon fontSize="small" />}
            selected={isRegistering}
            onClick={handleRegister}
          />
        </>
      }
    >
      <LostItemFilter initialFilters={filters} onApply={handleApplyFilters} />

      <S.LostItemList>
        {isLoading && <ListCardSkeleton />}

        {!isLoading && items.length === NO_ITEMS && (
          <Typography variant="subtitle">{C.EMPTY_LIST_MESSAGE}</Typography>
        )}

        {!isLoading &&
          items.map((item) => (
            <LostItemCard
              key={item.id}
              item={item}
              onEdit={handleEdit}
              onResolve={resolveItem}
              onCancel={cancelItem}
              onReopen={reopenItem}
            />
          ))}
      </S.LostItemList>

      {!isLoading && (
        <S.PaginationRow>
          <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} />
        </S.PaginationRow>
      )}

      <LostItemFormDialog open={isFormOpen} onClose={handleCloseForm} item={editingItem} />
    </PageShell>
  );
}
