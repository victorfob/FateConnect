import { useCallback, useState, type ChangeEvent, type SubmitEvent } from 'react';

import { LOST_ITEM_KIND_OPTIONS } from '@app/pages/LostAndFound/helpers/lostItemKind';
import { isLostItemStatus } from '@app/pages/LostAndFound/helpers/lostItemStatus';
import {
  LostItemStatusEnum,
  type LostItemFilter as LostItemFilterValues,
} from '@app/services/lostAndFound/types';
import { toApiDate } from '@app/utils/apiDate';
import { Button, Input, Typography } from '@design-system';
import { FilterAltIcon, SearchIcon } from '@design-system/icons';

import * as C from './constants';
import * as S from './styles';

type LostItemFilterProps = Readonly<{ onApply: (filters: LostItemFilterValues) => void }>;

export function LostItemFilter({ onApply }: LostItemFilterProps) {
  const [itemName, setItemName] = useState('');
  const [occurredOn, setOccurredOn] = useState<Date | null>(null);
  const [kind, setKind] = useState<string>(C.LostItemKindFilterEnum.ALL);
  const [owner, setOwner] = useState<string>(C.LostItemOwnerFilterEnum.ALL);
  // O mural mostra o que está aberto até que se peça outra coisa.
  const [status, setStatus] = useState<string>(LostItemStatusEnum.OPEN);

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

  const handleSubmit = useCallback(
    (event: SubmitEvent<HTMLElement>) => {
      event.preventDefault();

      const filters: LostItemFilterValues = {};
      // A escolha carrega o valor canônico, então dispensa estreitar o texto do campo.
      const selectedKind = LOST_ITEM_KIND_OPTIONS.find((option) => option.value === kind);

      if (itemName.trim()) filters.name = itemName.trim();
      if (occurredOn) filters.occurredOn = toApiDate(occurredOn);
      if (selectedKind) filters.kind = selectedKind.value;
      if (owner === C.LostItemOwnerFilterEnum.MINE) filters.onlyMine = true;
      if (isLostItemStatus(status)) filters.status = status;

      onApply(filters);
    },
    [itemName, occurredOn, kind, owner, status, onApply],
  );

  return (
    <S.FilterPanel defaultExpanded disableGutters>
      <S.FilterHeader>
        <FilterAltIcon />
        <Typography variant="subtitleBold" color="inherit">
          {C.FILTER_PANEL_TITLE}
        </Typography>
      </S.FilterHeader>

      <S.FilterBody>
        <S.FilterForm component="form" onSubmit={handleSubmit}>
          <S.FieldsRow>
            <S.FieldCell>
              <Input
                label={C.FILTER_LABELS.name}
                fullWidth
                placeholder={C.FILTER_PLACEHOLDERS.name}
                value={itemName}
                onChange={handleNameChange}
              />
            </S.FieldCell>

            <S.FieldCell>
              <Input.Date
                label={C.FILTER_LABELS.occurredOn}
                value={occurredOn}
                onChange={setOccurredOn}
              />
            </S.FieldCell>

            <S.FieldCell>
              <Input.Select
                label={C.FILTER_LABELS.kind}
                options={C.LOST_ITEM_KIND_FILTER_OPTIONS}
                value={kind}
                onChange={handleKindChange}
              />
            </S.FieldCell>

            <S.FieldCell>
              <Input.Select
                label={C.FILTER_LABELS.owner}
                options={C.LOST_ITEM_OWNER_FILTER_OPTIONS}
                value={owner}
                onChange={handleOwnerChange}
              />
            </S.FieldCell>

            <S.FieldCell>
              <Input.Select
                label={C.FILTER_LABELS.status}
                options={C.LOST_ITEM_STATUS_FILTER_OPTIONS}
                value={status}
                onChange={handleStatusChange}
              />
            </S.FieldCell>

            <S.SubmitCell>
              <Button type="submit" variant="contained" color="error" fullWidth>
                <SearchIcon fontSize="small" />
                <Typography variant="subtitleBold" color="inherit">
                  {C.FILTER_SUBMIT_LABEL}
                </Typography>
              </Button>
            </S.SubmitCell>
          </S.FieldsRow>
        </S.FilterForm>
      </S.FilterBody>
    </S.FilterPanel>
  );
}
