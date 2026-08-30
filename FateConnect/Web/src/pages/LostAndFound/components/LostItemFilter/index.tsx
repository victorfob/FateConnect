import { useCallback, useMemo, useState, type ChangeEvent } from 'react';
import { FilterPanel, Input } from '@design-system';

import { isLostItemKind } from '@app/pages/LostAndFound/helpers/lostItemKind';
import { isLostItemStatus } from '@app/pages/LostAndFound/helpers/lostItemStatus';
import {
  LostItemStatusEnum,
  type LostItemFilter as LostItemFilterValues,
} from '@app/services/lostAndFound/types';
import { fromFormDate, toApiDate } from '@app/utils/apiDate';

import * as C from './constants';

/** Células por linha no desktop: cinco campos e o botão quebram em duas. */
const FILTER_COLUMNS = 3;

/** O mural já abre em Aberto, e paginação não é escolha de busca: nenhum dos dois acende o ponto. */
function isBeyondDefault({
  name,
  occurredOn,
  kind,
  onlyMine,
  status,
}: LostItemFilterValues): boolean {
  if (name || occurredOn || kind || onlyMine) return true;

  return status !== LostItemStatusEnum.OPEN;
}

type LostItemFilterProps = Readonly<{
  initialFilters: LostItemFilterValues;
  onApply: (filters: LostItemFilterValues) => void;
}>;

export function LostItemFilter({ initialFilters, onApply }: LostItemFilterProps) {
  const [itemName, setItemName] = useState(initialFilters.name ?? '');
  const [occurredOn, setOccurredOn] = useState<Date | null>(() =>
    fromFormDate(initialFilters.occurredOn ?? ''),
  );
  const [kind, setKind] = useState<string>(initialFilters.kind ?? C.LostItemKindFilterEnum.ALL);
  const [owner, setOwner] = useState<string>(() => {
    if (initialFilters.onlyMine) return C.LostItemOwnerFilterEnum.MINE;

    return C.LostItemOwnerFilterEnum.ALL;
  });
  const [status, setStatus] = useState<string>(initialFilters.status ?? LostItemStatusEnum.OPEN);
  const [isFiltered, setIsFiltered] = useState(() => isBeyondDefault(initialFilters));
  // Item achado ou perdido só pode ter ocorrido até hoje.
  const today = useMemo(() => new Date(), []);

  const handleNameChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setItemName(event.target.value),
    [],
  );
  const handleKindChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setKind(event.target.value),
    [],
  );
  const handleOwnerChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setOwner(event.target.value),
    [],
  );
  const handleStatusChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setStatus(event.target.value),
    [],
  );

  const handleSubmit = useCallback(() => {
    const filters: LostItemFilterValues = {};

    if (itemName.trim()) filters.name = itemName.trim();
    if (occurredOn) filters.occurredOn = toApiDate(occurredOn);
    if (isLostItemKind(kind)) filters.kind = kind;
    if (owner === C.LostItemOwnerFilterEnum.MINE) filters.onlyMine = true;
    if (isLostItemStatus(status)) filters.status = status;

    setIsFiltered(isBeyondDefault(filters));
    onApply(filters);
  }, [itemName, occurredOn, kind, owner, status, onApply]);

  return (
    <FilterPanel
      title={C.FILTER_PANEL_TITLE}
      submitLabel={C.FILTER_SUBMIT_LABEL}
      columns={FILTER_COLUMNS}
      active={isFiltered}
      onSubmit={handleSubmit}
    >
      <FilterPanel.Field>
        <Input
          label={C.FILTER_LABELS.name}
          fullWidth
          placeholder={C.FILTER_PLACEHOLDERS.name}
          value={itemName}
          onChange={handleNameChange}
        />
      </FilterPanel.Field>

      <FilterPanel.Field>
        <Input.Date
          label={C.FILTER_LABELS.occurredOn}
          value={occurredOn}
          onChange={setOccurredOn}
          maxDate={today}
        />
      </FilterPanel.Field>

      <FilterPanel.Field>
        <Input.Select
          label={C.FILTER_LABELS.kind}
          options={C.LOST_ITEM_KIND_FILTER_OPTIONS}
          value={kind}
          onChange={handleKindChange}
        />
      </FilterPanel.Field>

      <FilterPanel.Field>
        <Input.Select
          label={C.FILTER_LABELS.owner}
          options={C.LOST_ITEM_OWNER_FILTER_OPTIONS}
          value={owner}
          onChange={handleOwnerChange}
        />
      </FilterPanel.Field>

      <FilterPanel.Field>
        <Input.Select
          label={C.FILTER_LABELS.status}
          options={C.LOST_ITEM_STATUS_FILTER_OPTIONS}
          value={status}
          onChange={handleStatusChange}
        />
      </FilterPanel.Field>
    </FilterPanel>
  );
}
