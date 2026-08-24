import { useCallback, useState } from 'react';
import { NavLink } from 'react-router';
import { useQuery } from '@tanstack/react-query';

import { RoutePathEnum } from '@app/routes/paths';
import { listLostItems } from '@app/services/lostAndFound/lostAndFoundService';
import {
  LostItemStatusEnum,
  type LostItemFilter as LostItemFilterValues,
} from '@app/services/lostAndFound/types';
import { CircularProgress, PageShell, Typography } from '@design-system';
import { AddIcon, ArrowBackIcon, SearchIcon } from '@design-system/icons';

import { LostItemCard } from './components/LostItemCard';
import { LostItemFilter } from './components/LostItemFilter';
import * as C from './constants';
import * as S from './styles';

const SPINNER_SIZE_PX = 60;

/** O mural abre nos itens em aberto; as outras situações vêm pelo filtro. */
const INITIAL_FILTERS: LostItemFilterValues = { status: LostItemStatusEnum.OPEN };

export function LostAndFound() {
  const [filters, setFilters] = useState<LostItemFilterValues>(INITIAL_FILTERS);

  const { data: items = [], isPending } = useQuery({
    queryKey: [C.LOST_ITEMS_QUERY_KEY, filters],
    queryFn: () => listLostItems(filters),
    meta: { errorMessage: C.LOST_ITEM_LIST_MESSAGES.loadFailed },
  });

  const handleApplyFilters = useCallback(
    (applied: LostItemFilterValues) => setFilters(applied),
    [],
  );

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
            selected
          />
          <PageShell.Tab
            label={C.REGISTER_TAB_LABEL}
            icon={<AddIcon fontSize="small" />}
            selected={false}
          />
        </>
      }
    >
      <LostItemFilter onApply={handleApplyFilters} />

      <S.LostItemList>
        {isPending && (
          <S.LoadingContainer>
            <CircularProgress size={SPINNER_SIZE_PX} />
          </S.LoadingContainer>
        )}

        {!isPending && items.length === 0 && (
          <Typography variant="subtitle">{C.EMPTY_LIST_MESSAGE}</Typography>
        )}

        {!isPending && items.map((item) => <LostItemCard key={item.id} item={item} />)}
      </S.LostItemList>
    </PageShell>
  );
}
