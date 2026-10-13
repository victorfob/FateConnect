import { Button, CardsList, ListCard, PageShell, Pagination } from '@design-system';
import { DoneAllIcon } from '@design-system/icons';

import { ActionBar } from '@app/components/ActionBar';
import { BackToMenu } from '@app/components/BackToMenu';
import { InAppNotificationItem } from '@app/components/InAppNotificationItem';
import {
  IN_APP_NOTIFICATION_TEXTS,
  IN_APP_NOTIFICATIONS_QUERY_KEY,
} from '@app/constants/inAppNotifications';
import { useInAppNotificationActions } from '@app/hooks/useInAppNotificationActions';
import { usePagedSearch } from '@app/hooks/usePagedSearch';
import { useUnreadInAppNotificationCount } from '@app/hooks/useUnreadInAppNotificationCount';
import { listInAppNotifications } from '@app/services/inAppNotifications/inAppNotificationsService';
import { PAGE_SIZE } from '@app/utils/searchParams';

import { NotificationFilter } from './components/NotificationFilter';
import { notificationSearchCodec } from './helpers/searchQuery';
import * as C from './constants';

const NO_ITEMS = 0;
const NO_UNREAD = 0;

export function Notifications() {
  const unreadCount = useUnreadInAppNotificationCount();
  const { openNotification, markAsRead, markAllAsRead, isMarkingAll } =
    useInAppNotificationActions();

  const { filters, items, totalPages, currentPage, isPending, isError, applyFilters, changePage } =
    usePagedSearch({
      codec: notificationSearchCodec,
      queryKey: IN_APP_NOTIFICATIONS_QUERY_KEY,
      listFunction: listInAppNotifications,
      errorMessage: IN_APP_NOTIFICATION_TEXTS.loadFailed,
    });

  return (
    <PageShell
      title={C.NOTIFICATIONS_TITLE}
      titleAction={<NotificationFilter initialFilters={filters} onApply={applyFilters} />}
      action={<BackToMenu />}
    >
      <CardsList
        isLoading={isPending}
        skeletonCount={PAGE_SIZE}
        isEmpty={items.length === NO_ITEMS}
        emptyMessage={isError ? IN_APP_NOTIFICATION_TEXTS.loadFailed : C.EMPTY_LIST_MESSAGE}
        pagination={<Pagination count={totalPages} page={currentPage} onChange={changePage} />}
      >
        {items.map((notification) => (
          <ListCard key={notification.id}>
            <InAppNotificationItem
              notification={notification}
              onOpen={openNotification}
              onMarkAsRead={markAsRead}
            />
          </ListCard>
        ))}
      </CardsList>

      {unreadCount > NO_UNREAD && (
        <ActionBar>
          <Button
            variant="contained"
            color="secondary"
            loading={isMarkingAll}
            onClick={markAllAsRead}
          >
            <DoneAllIcon fontSize="small" />
            {IN_APP_NOTIFICATION_TEXTS.markAllAsRead}
          </Button>
        </ActionBar>
      )}
    </PageShell>
  );
}
