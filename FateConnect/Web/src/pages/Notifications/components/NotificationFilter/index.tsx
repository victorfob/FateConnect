import { useCallback, useState, type ChangeEvent } from 'react';
import { FilterDialog, Input } from '@design-system';

import { isInAppNotificationType } from '@app/pages/Notifications/helpers/notificationType';
import type { InAppNotificationFilter } from '@app/services/inAppNotifications/types';

import * as C from './constants';

type NotificationFilterProps = Readonly<{
  initialFilters: InAppNotificationFilter;
  onApply: (filters: InAppNotificationFilter) => void;
}>;

function initialStatus({ isRead }: InAppNotificationFilter): string {
  if (isRead === false) return C.NotificationStatusFilterEnum.UNREAD;

  return C.NotificationStatusFilterEnum.ALL;
}

function isFilteredBy({ isRead, type }: InAppNotificationFilter): boolean {
  return isRead === false || Boolean(type);
}

export function NotificationFilter({ initialFilters, onApply }: NotificationFilterProps) {
  const [status, setStatus] = useState(() => initialStatus(initialFilters));
  const [type, setType] = useState<string>(initialFilters.type ?? C.NotificationTypeFilterEnum.ALL);
  const [isFiltered, setIsFiltered] = useState(() => isFilteredBy(initialFilters));

  const handleStatusChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setStatus(event.target.value),
    [],
  );
  const handleTypeChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setType(event.target.value),
    [],
  );

  const handleClear = useCallback(() => {
    setStatus(C.NotificationStatusFilterEnum.ALL);
    setType(C.NotificationTypeFilterEnum.ALL);
    setIsFiltered(false);
    onApply({});
  }, [onApply]);

  const handleSubmit = useCallback(() => {
    const filters: InAppNotificationFilter = {};

    if (status === C.NotificationStatusFilterEnum.UNREAD) filters.isRead = false;
    if (isInAppNotificationType(type)) filters.type = type;

    setIsFiltered(isFilteredBy(filters));
    onApply(filters);
  }, [status, type, onApply]);

  return (
    <FilterDialog active={isFiltered} onSubmit={handleSubmit} onClear={handleClear}>
      <FilterDialog.Field>
        <Input.Select
          label={C.FILTER_LABELS.status}
          options={C.NOTIFICATION_STATUS_FILTER_OPTIONS}
          value={status}
          onChange={handleStatusChange}
        />
      </FilterDialog.Field>

      <FilterDialog.Field>
        <Input.Select
          label={C.FILTER_LABELS.type}
          options={C.NOTIFICATION_TYPE_FILTER_OPTIONS}
          value={type}
          onChange={handleTypeChange}
        />
      </FilterDialog.Field>
    </FilterDialog>
  );
}
