import { useCallback, useState } from 'react';
import { CardsList, PageShell, Pagination } from '@design-system';
import { FormatListBulletedIcon, SendIcon } from '@design-system/icons';

import { BackToMenu } from '@app/components/BackToMenu';
import { ReportCard } from '@app/components/ReportCard';
import { usePagedSearch } from '@app/hooks/usePagedSearch';
import { listMyReports } from '@app/services/reports/reportsService';
import { PAGE_SIZE } from '@app/utils/searchParams';

import { ReportFilter } from './components/ReportFilter';
import { ReportFormDialog } from './components/ReportFormDialog';
import { reportSearchCodec } from './helpers/searchQuery';
import * as C from './constants';

const NO_ITEMS = 0;

export function Reports() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { filters, items, totalPages, currentPage, isPending, applyFilters, changePage } =
    usePagedSearch({
      codec: reportSearchCodec,
      queryKey: C.REPORTS_QUERY_KEY,
      listFunction: listMyReports,
      errorMessage: C.REPORT_LIST_MESSAGES.loadFailed,
    });

  const handleOpenForm = useCallback(() => setIsFormOpen(true), []);
  const handleCloseForm = useCallback(() => setIsFormOpen(false), []);

  return (
    <PageShell
      title={C.REPORTS_TITLE}
      titleAction={<ReportFilter initialFilters={filters} onApply={applyFilters} />}
      action={<BackToMenu />}
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
        {items.map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}
      </CardsList>

      <ReportFormDialog open={isFormOpen} onClose={handleCloseForm} />
    </PageShell>
  );
}
