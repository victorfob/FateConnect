import { useCallback, useState, type ChangeEvent } from 'react';
import { FilterDialog, Input } from '@design-system';

import { isReportStatus } from '@app/services/reports/reportStatus';
import type { ReportFilter as ReportFilterValues } from '@app/services/reports/types';

import * as C from './constants';

type ReportFilterProps = Readonly<{
  initialFilters: ReportFilterValues;
  onApply: (filters: ReportFilterValues) => void;
}>;

export function ReportFilter({ initialFilters, onApply }: ReportFilterProps) {
  const [status, setStatus] = useState<string>(
    initialFilters.status ?? C.ReportStatusFilterEnum.ALL,
  );
  // A lista abre em todas as situações, então filtrar é sempre escolha de quem filtra.
  const [isFiltered, setIsFiltered] = useState(Boolean(initialFilters.status));

  const handleStatusChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setStatus(event.target.value),
    [],
  );

  const handleClear = useCallback(() => {
    setStatus(C.ReportStatusFilterEnum.ALL);
    setIsFiltered(false);
    onApply({});
  }, [onApply]);

  const handleSubmit = useCallback(() => {
    const filters: ReportFilterValues = {};

    if (isReportStatus(status)) filters.status = status;

    setIsFiltered(Boolean(filters.status));
    onApply(filters);
  }, [status, onApply]);

  return (
    <FilterDialog active={isFiltered} onSubmit={handleSubmit} onClear={handleClear}>
      <FilterDialog.Field>
        <Input.Select
          label={C.FILTER_LABELS.status}
          options={C.REPORT_STATUS_FILTER_OPTIONS}
          value={status}
          onChange={handleStatusChange}
        />
      </FilterDialog.Field>
    </FilterDialog>
  );
}
