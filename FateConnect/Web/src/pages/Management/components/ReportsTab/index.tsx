import { useCallback } from 'react';
import { CardsList, Pagination } from '@design-system';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ReportCard } from '@app/components/ReportCard';
import { useNotification } from '@app/hooks/useNotification';
import { usePagedSearch } from '@app/hooks/usePagedSearch';
import { listReports, updateReportStatus } from '@app/services/reports/reportsService';
import type { Report, ReportStatusEnum } from '@app/services/reports/types';
import { PAGE_SIZE } from '@app/utils/searchParams';

import { ManagementShell } from '../ManagementShell';
import { ReporterContact } from './components/ReporterContact';
import { ReportsFilter } from './components/ReportsFilter';
import { ReportStatusAction } from './components/ReportStatusAction';
import { managementReportCodec } from './helpers/searchQuery';
import * as C from './constants';

const NO_ITEMS = 0;

export function ReportsTab() {
  const queryClient = useQueryClient();
  const { notifySuccess } = useNotification();

  const { filters, items, totalPages, currentPage, isPending, applyFilters, changePage } =
    usePagedSearch({
      codec: managementReportCodec,
      queryKey: C.REPORTS_QUERY_KEY,
      listFunction: listReports,
      errorMessage: C.REPORT_LIST_MESSAGES.loadFailed,
    });

  const { mutate: changeStatus } = useMutation({
    mutationFn: ({ report, status }: { report: Report; status: ReportStatusEnum }) =>
      updateReportStatus(report.id, status),
    onSuccess: () => {
      notifySuccess(C.REPORT_LIST_MESSAGES.statusChanged);
      void queryClient.invalidateQueries({ queryKey: [C.REPORTS_QUERY_KEY] });
    },
    meta: { errorMessage: C.REPORT_LIST_MESSAGES.statusFailed },
  });

  const handleStatusConfirm = useCallback(
    (report: Report, status: ReportStatusEnum) => changeStatus({ report, status }),
    [changeStatus],
  );

  return (
    <ManagementShell
      titleAction={<ReportsFilter initialFilters={filters} onApply={applyFilters} />}
    >
      <CardsList
        isLoading={isPending}
        skeletonCount={PAGE_SIZE}
        isEmpty={items.length === NO_ITEMS}
        emptyMessage={C.EMPTY_LIST_MESSAGE}
        pagination={<Pagination count={totalPages} page={currentPage} onChange={changePage} />}
      >
        {items.map((report) => (
          <ReportCard
            key={report.id}
            report={report}
            reporterContact={<ReporterContact user={report.user} />}
            actions={<ReportStatusAction report={report} onConfirm={handleStatusConfirm} />}
          />
        ))}
      </CardsList>
    </ManagementShell>
  );
}
