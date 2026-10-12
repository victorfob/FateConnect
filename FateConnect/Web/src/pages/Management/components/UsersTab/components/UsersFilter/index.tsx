import { useCallback, useState, type ChangeEvent } from 'react';
import { FilterDialog, Input } from '@design-system';

import { isAccountStatus } from '@app/pages/Management/components/UsersTab/helpers/accountStatus';
import { isProfileType } from '@app/pages/Management/components/UsersTab/helpers/profileType';
import type { UserFilter } from '@app/services/users/managementTypes';

import * as C from './constants';

function isFilled({ searchTerm, status, profileType }: UserFilter): boolean {
  return Boolean(searchTerm || status || profileType);
}

type UsersFilterProps = Readonly<{
  initialFilters: UserFilter;
  onApply: (filters: UserFilter) => void;
}>;

export function UsersFilter({ initialFilters, onApply }: UsersFilterProps) {
  const [searchTerm, setSearchTerm] = useState(initialFilters.searchTerm ?? '');
  const [status, setStatus] = useState<string>(initialFilters.status ?? C.UserFilterEnum.ALL);
  const [profileType, setProfileType] = useState<string>(
    initialFilters.profileType ?? C.UserFilterEnum.ALL,
  );
  const [isFiltered, setIsFiltered] = useState(() => isFilled(initialFilters));

  const handleSearchTermChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setSearchTerm(event.target.value),
    [],
  );
  const handleStatusChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setStatus(event.target.value),
    [],
  );
  const handleProfileTypeChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setProfileType(event.target.value),
    [],
  );

  const handleClear = useCallback(() => {
    setSearchTerm('');
    setStatus(C.UserFilterEnum.ALL);
    setProfileType(C.UserFilterEnum.ALL);
    setIsFiltered(false);
    onApply({});
  }, [onApply]);

  const handleSubmit = useCallback(() => {
    const filters: UserFilter = {};

    if (searchTerm.trim()) filters.searchTerm = searchTerm.trim();
    if (isAccountStatus(status)) filters.status = status;
    if (isProfileType(profileType)) filters.profileType = profileType;

    setIsFiltered(isFilled(filters));
    onApply(filters);
  }, [searchTerm, status, profileType, onApply]);

  return (
    <FilterDialog active={isFiltered} onSubmit={handleSubmit} onClear={handleClear}>
      <FilterDialog.Field>
        <Input
          label={C.FILTER_LABELS.searchTerm}
          fullWidth
          value={searchTerm}
          onChange={handleSearchTermChange}
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

      <FilterDialog.Field>
        <Input.Select
          label={C.FILTER_LABELS.profileType}
          options={C.PROFILE_FILTER_OPTIONS}
          value={profileType}
          onChange={handleProfileTypeChange}
        />
      </FilterDialog.Field>
    </FilterDialog>
  );
}
