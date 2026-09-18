import { useCallback, useState } from 'react';
import { NavLink } from 'react-router';
import { CardsList, PageShell, Pagination } from '@design-system';
import { ArrowBackIcon, FormatListBulletedIcon, SendIcon } from '@design-system/icons';

import { DenunciationCard } from '@app/components/DenunciationCard';
import { usePagedSearch } from '@app/hooks/usePagedSearch';
import { RoutePathEnum } from '@app/routes/paths';
import { listDenunciations } from '@app/services/denunciations/denunciationsService';
import { PAGE_SIZE } from '@app/utils/searchParams';

import { DenunciationFilter } from './components/DenunciationFilter';
import { DenunciationFormDialog } from './components/DenunciationFormDialog';
import { denunciationSearchCodec } from './helpers/searchQuery';
import * as C from './constants';

const NO_ITEMS = 0;

export function Denunciations() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { filters, items, totalPages, currentPage, isPending, applyFilters, changePage } =
    usePagedSearch({
      codec: denunciationSearchCodec,
      queryKey: C.DENUNCIATIONS_QUERY_KEY,
      listFunction: listDenunciations,
      errorMessage: C.DENUNCIATION_LIST_MESSAGES.loadFailed,
    });

  const handleOpenForm = useCallback(() => setIsFormOpen(true), []);
  const handleCloseForm = useCallback(() => setIsFormOpen(false), []);

  return (
    <PageShell
      title={C.DENUNCIATIONS_TITLE}
      titleAction={<DenunciationFilter initialFilters={filters} onApply={applyFilters} />}
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
            label={C.LIST_TAB_LABEL}
            icon={<FormatListBulletedIcon fontSize="small" />}
            selected={!isFormOpen}
          />
          <PageShell.Tab
            label={C.SEND_TAB_LABEL}
            icon={<SendIcon fontSize="small" />}
            selected={isFormOpen}
            onClick={handleOpenForm}
          />
        </>
      }
    >
      <CardsList
        isLoading={isPending}
        skeletonCount={PAGE_SIZE}
        isEmpty={items.length === NO_ITEMS}
        emptyMessage={C.EMPTY_LIST_MESSAGE}
        pagination={<Pagination count={totalPages} page={currentPage} onChange={changePage} />}
      >
        {items.map((denunciation) => (
          <DenunciationCard key={denunciation.id} denunciation={denunciation} />
        ))}
      </CardsList>

      <DenunciationFormDialog open={isFormOpen} onClose={handleCloseForm} />
    </PageShell>
  );
}
