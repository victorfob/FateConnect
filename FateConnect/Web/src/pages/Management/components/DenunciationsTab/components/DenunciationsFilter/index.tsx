import { useCallback, useMemo, useState, type ChangeEvent } from 'react';
import { FilterDialog, Input } from '@design-system';

import { isDenunciationCategory } from '@app/pages/Denunciations/helpers/denunciationCategory';
import { isDenunciationStatus } from '@app/services/denunciations/denunciationStatus';
import type { DenunciationFilter } from '@app/services/denunciations/types';
import { toApiDateRange, toDisplayDateRange } from '@app/utils/apiDate';

import * as C from './constants';

/** A lista abre em todas, então qualquer campo preenchido é escolha de quem filtra. */
function isFilled({ searchTerm, dateFrom, dateTo, category, status }: DenunciationFilter): boolean {
  return Boolean(searchTerm || dateFrom || dateTo || category || status);
}

type DenunciationsFilterProps = Readonly<{
  initialFilters: DenunciationFilter;
  onApply: (filters: DenunciationFilter) => void;
}>;

export function DenunciationsFilter({ initialFilters, onApply }: DenunciationsFilterProps) {
  const [searchTerm, setSearchTerm] = useState(initialFilters.searchTerm ?? '');
  const [period, setPeriod] = useState(() =>
    toDisplayDateRange(initialFilters.dateFrom, initialFilters.dateTo),
  );
  const [category, setCategory] = useState<string>(
    initialFilters.category ?? C.DenunciationFilterEnum.ALL,
  );
  const [status, setStatus] = useState<string>(
    initialFilters.status ?? C.DenunciationFilterEnum.ALL,
  );
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
    setCategory(C.DenunciationFilterEnum.ALL);
    setStatus(C.DenunciationFilterEnum.ALL);
    setIsFiltered(false);
    onApply({});
  }, [onApply]);

  const handleSubmit = useCallback(() => {
    const filters: DenunciationFilter = {};
    const { dateFrom, dateTo } = toApiDateRange(period);

    if (searchTerm.trim()) filters.searchTerm = searchTerm.trim();
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;
    if (isDenunciationCategory(category)) filters.category = category;
    if (isDenunciationStatus(status)) filters.status = status;

    setIsFiltered(isFilled(filters));
    onApply(filters);
  }, [searchTerm, period, category, status, onApply]);

  return (
    <FilterDialog
      submitLabel={C.FILTER_SUBMIT_LABEL}
      clearLabel={C.FILTER_CLEAR_LABEL}
      active={isFiltered}
      onSubmit={handleSubmit}
      onClear={handleClear}
    >
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
