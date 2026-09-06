import { useCallback, useState } from 'react';
import { NavLink } from 'react-router';
import { CardsList, PageShell, Pagination } from '@design-system';
import { AddIcon, ArrowBackIcon, SearchIcon } from '@design-system/icons';

import { usePagedSearch } from '@app/hooks/usePagedSearch';
import { RoutePathEnum } from '@app/routes/paths';
import { listLostItems } from '@app/services/lostAndFound/lostAndFoundService';
import type { LostItem } from '@app/services/lostAndFound/types';

import { LostItemCard } from './components/LostItemCard';
import { LostItemFilter } from './components/LostItemFilter';
import { LostItemFormDialog } from './components/LostItemFormDialog';
import { lostItemSearchCodec } from './helpers/searchQuery';
import { useLostItemTransitions } from './hooks/useLostItemTransitions';
import * as C from './constants';

const NO_ITEMS = 0;

export function LostAndFound() {
  const [editingItem, setEditingItem] = useState<LostItem | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { resolveItem, deleteItem, restoreItem, isTransitioning } = useLostItemTransitions();

  const { filters, items, totalPages, currentPage, isPending, applyFilters, changePage } =
    usePagedSearch({
      codec: lostItemSearchCodec,
      queryKey: C.LOST_ITEMS_QUERY_KEY,
      listFunction: listLostItems,
      errorMessage: C.LOST_ITEM_LIST_MESSAGES.loadFailed,
    });

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
      <LostItemFilter initialFilters={filters} onApply={applyFilters} />

      <CardsList
        isLoading={isLoading}
        isEmpty={items.length === NO_ITEMS}
        emptyMessage={C.EMPTY_LIST_MESSAGE}
        pagination={<Pagination count={totalPages} page={currentPage} onChange={changePage} />}
      >
        {items.map((item) => (
          <LostItemCard
            key={item.id}
            item={item}
            onEdit={handleEdit}
            onResolve={resolveItem}
            onDelete={deleteItem}
            onRestore={restoreItem}
          />
        ))}
      </CardsList>

      <LostItemFormDialog open={isFormOpen} onClose={handleCloseForm} item={editingItem} />
    </PageShell>
  );
}
