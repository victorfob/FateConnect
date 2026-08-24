import { useCallback, useState } from 'react';
import { NavLink } from 'react-router';
import { useQuery } from '@tanstack/react-query';

import { RoutePathEnum } from '@app/routes/paths';
import { listLostItems } from '@app/services/lostAndFound/lostAndFoundService';
import {
  LostItemStatusEnum,
  type LostItem,
  type LostItemFilter as LostItemFilterValues,
} from '@app/services/lostAndFound/types';
import { CircularProgress, PageShell, Typography } from '@design-system';
import { AddIcon, ArrowBackIcon, SearchIcon } from '@design-system/icons';

import { LostItemCard } from './components/LostItemCard';
import { LostItemFilter } from './components/LostItemFilter';
import { LostItemFormDialog } from './components/LostItemFormDialog';
import { useLostItemTransitions } from './hooks/useLostItemTransitions';
import * as C from './constants';
import * as S from './styles';

const SPINNER_SIZE_PX = 60;

const INITIAL_FILTERS: LostItemFilterValues = { status: LostItemStatusEnum.OPEN };

export function LostAndFound() {
  const [filters, setFilters] = useState<LostItemFilterValues>(INITIAL_FILTERS);
  const [editingItem, setEditingItem] = useState<LostItem | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { resolveItem, cancelItem, reopenItem, isTransitioning } = useLostItemTransitions();

  const { data: items = [], isPending } = useQuery({
    queryKey: [C.LOST_ITEMS_QUERY_KEY, filters],
    queryFn: () => listLostItems(filters),
    meta: { errorMessage: C.LOST_ITEM_LIST_MESSAGES.loadFailed },
  });

  const handleApplyFilters = useCallback(
    (applied: LostItemFilterValues) => setFilters(applied),
    [],
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
      <LostItemFilter onApply={handleApplyFilters} />

      <S.LostItemList>
        {isLoading && (
          <S.LoadingContainer>
            <CircularProgress size={SPINNER_SIZE_PX} />
          </S.LoadingContainer>
        )}

        {!isLoading && items.length === 0 && (
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

      <LostItemFormDialog open={isFormOpen} onClose={handleCloseForm} item={editingItem} />
    </PageShell>
  );
}
