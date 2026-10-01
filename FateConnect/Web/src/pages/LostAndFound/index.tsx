import { useCallback, useState } from 'react';
import { CardsList, PageShell, Pagination } from '@design-system';
import { AddIcon, SearchIcon } from '@design-system/icons';

import { BackToMenu } from '@app/components/BackToMenu';
import { ContactRequiredDialog } from '@app/components/ContactRequiredDialog';
import { ContactRequiredActionEnum } from '@app/components/ContactRequiredDialog/@types';
import { useContactGate } from '@app/hooks/useContactGate';
import { usePagedSearch } from '@app/hooks/usePagedSearch';
import { listLostItems } from '@app/services/lostAndFound/lostAndFoundService';
import type { LostItem } from '@app/services/lostAndFound/types';
import { PAGE_SIZE } from '@app/utils/searchParams';

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
  const { contactDialogOpen, guard, showContactRequired, closeContactDialog } = useContactGate();
  const { resolveItem, deleteItem, restoreItem, isTransitioning } = useLostItemTransitions();

  const { filters, items, totalPages, currentPage, isPending, applyFilters, changePage } =
    usePagedSearch({
      codec: lostItemSearchCodec,
      queryKey: C.LOST_ITEMS_QUERY_KEY,
      listFunction: listLostItems,
      errorMessage: C.LOST_ITEM_LIST_MESSAGES.loadFailed,
    });

  const handleRegister = useCallback(
    () =>
      guard(() => {
        setEditingItem(undefined);
        setIsFormOpen(true);
      }),
    [guard],
  );

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
      titleAction={<LostItemFilter initialFilters={filters} onApply={applyFilters} />}
      action={<BackToMenu />}
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
      <CardsList
        isLoading={isLoading}
        skeletonCount={PAGE_SIZE}
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

      <LostItemFormDialog
        open={isFormOpen}
        onClose={handleCloseForm}
        item={editingItem}
        onContactRequired={showContactRequired}
      />

      <ContactRequiredDialog
        open={contactDialogOpen}
        action={ContactRequiredActionEnum.REGISTER_ITEM}
        onClose={closeContactDialog}
      />
    </PageShell>
  );
}
