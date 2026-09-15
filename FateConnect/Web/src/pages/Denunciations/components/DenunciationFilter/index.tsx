import { useCallback, useState, type ChangeEvent } from 'react';
import { FilterDialog, Input } from '@design-system';

import { isDenunciationStatus } from '@app/services/denunciations/denunciationStatus';
import type { DenunciationFilter as DenunciationFilterValues } from '@app/services/denunciations/types';

import * as C from './constants';

type DenunciationFilterProps = Readonly<{
  initialFilters: DenunciationFilterValues;
  onApply: (filters: DenunciationFilterValues) => void;
}>;

export function DenunciationFilter({ initialFilters, onApply }: DenunciationFilterProps) {
  const [status, setStatus] = useState<string>(
    initialFilters.status ?? C.DenunciationStatusFilterEnum.ALL,
  );
  // A lista abre em todas as situações, então filtrar é sempre escolha de quem filtra.
  const [isFiltered, setIsFiltered] = useState(Boolean(initialFilters.status));

  const handleStatusChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setStatus(event.target.value),
    [],
  );

  const handleClear = useCallback(() => {
    setStatus(C.DenunciationStatusFilterEnum.ALL);
    setIsFiltered(false);
    onApply({});
  }, [onApply]);

  const handleSubmit = useCallback(() => {
    const filters: DenunciationFilterValues = {};

    if (isDenunciationStatus(status)) filters.status = status;

    setIsFiltered(Boolean(filters.status));
    onApply(filters);
  }, [status, onApply]);

  return (
    <FilterDialog
      triggerLabel={C.FILTER_TITLE}
      title={C.FILTER_TITLE}
      submitLabel={C.FILTER_SUBMIT_LABEL}
      clearLabel={C.FILTER_CLEAR_LABEL}
      active={isFiltered}
      onSubmit={handleSubmit}
      onClear={handleClear}
    >
      <FilterDialog.Field>
        <Input.Select
          label={C.FILTER_LABELS.status}
          options={C.DENUNCIATION_STATUS_FILTER_OPTIONS}
          value={status}
          onChange={handleStatusChange}
        />
      </FilterDialog.Field>
    </FilterDialog>
  );
}
