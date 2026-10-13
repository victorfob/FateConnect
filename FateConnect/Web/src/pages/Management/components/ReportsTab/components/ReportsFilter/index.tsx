import { useCallback, useMemo, useState, type ChangeEvent } from 'react';
import { FilterDialog, Input } from '@design-system';

import { isReportCategory } from '@app/pages/Reports/helpers/reportCategory';
import { isReportStatus } from '@app/services/reports/reportStatus';
import type { ReportFilter } from '@app/services/reports/types';
import { toApiDateRange, toDisplayDateRange } from '@app/utils/apiDate';

import * as C from './constants';

/** A lista abre em todas, então qualquer campo preenchido é escolha de quem filtra. */
function isFilled({ searchTerm, dateFrom, dateTo, category, status }: ReportFilter): boolean {
  return Boolean(searchTerm || dateFrom || dateTo || category || status);
}

type ReportsFilterProps = Readonly<{
  initialFilters: ReportFilter;
  onApply: (filters: ReportFilter) => void;
}>;

export function ReportsFilter({ initialFilters, onApply }: ReportsFilterProps) {
  const [searchTerm, setSearchTerm] = useState(initialFilters.searchTerm ?? '');
  const [period, setPeriod] = useState(() =>
    toDisplayDateRange(initialFilters.dateFrom, initialFilters.dateTo),
  );
  const [category, setCategory] = useState<string>(
    initialFilters.category ?? C.ReportFilterEnum.ALL,
  );
  const [status, setStatus] = useState<string>(initialFilters.status ?? C.ReportFilterEnum.ALL);
  const [isFiltered, setIsFiltered] = useState(() => isFilled(initialFilters));
  // Denúncia só pode ter sido enviada até hoje.
  const today = useMemo(() => new Date(), []);

  const handleSearchTermChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setSearchTerm(event.target.value),
    [],
  );
  const handleCategoryChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setCategory(event.target.value),
    [],
  );
  const handleStatusChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setStatus(event.target.value),
    [],
  );

  const handleClear = useCallback(() => {
    setSearchTerm('');
    setPeriod('');
    setCategory(C.ReportFilterEnum.ALL);
    setStatus(C.ReportFilterEnum.ALL);
    setIsFiltered(false);
    onApply({});
  }, [onApply]);

  const handleSubmit = useCallback(() => {
    const filters: ReportFilter = {};
    const { dateFrom, dateTo } = toApiDateRange(period);

    if (searchTerm.trim()) filters.searchTerm = searchTerm.trim();
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;
    if (isReportCategory(category)) filters.category = category;
    if (isReportStatus(status)) filters.status = status;

    setIsFiltered(isFilled(filters));
    onApply(filters);
  }, [searchTerm, period, category, status, onApply]);

  return (
    <FilterDialog active={isFiltered} onSubmit={handleSubmit} onClear={handleClear}>
      <FilterDialog.Field>
        <Input
          label={C.FILTER_LABELS.searchTerm}
          fullWidth
          placeholder={C.FILTER_PLACEHOLDERS.searchTerm}
          value={searchTerm}
          onChange={handleSearchTermChange}
        />
      </FilterDialog.Field>

      <FilterDialog.Field>
        <Input.DateRange
          label={C.FILTER_LABELS.period}
          value={period}
          onChange={setPeriod}
          maxDate={today}
        />
      </FilterDialog.Field>

      <FilterDialog.Field>
        <Input.Select
          label={C.FILTER_LABELS.category}
          options={C.CATEGORY_FILTER_OPTIONS}
          value={category}
          onChange={handleCategoryChange}
        />
      </FilterDialog.Field>

      <FilterDialog.Field>
        <Input.Select
          label={C.FILTER_LABELS.status}
          options={C.STATUS_FILTER_OPTIONS}
          value={status}
          onChange={handleStatusChange}
        />
      </FilterDialog.Field>
    </FilterDialog>
  );
}
