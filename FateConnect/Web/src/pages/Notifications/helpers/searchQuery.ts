import type { SearchQueryCodec } from '@app/hooks/useSearchQuery';
import type { InAppNotificationFilter } from '@app/services/inAppNotifications/types';
import { PAGE_SIZE, readPageParam, writePageParam } from '@app/utils/searchParams';

import { notificationTypeSlug, parseNotificationType } from './notificationType';

/** A central abre com todas, então só a escolha de não lidas ocupa a URL. */
const UNREAD = 'nao-lidas';

enum SearchParamEnum {
  STATUS = 'situacao',
  TYPE = 'tipo',
}

function fromParams(params: URLSearchParams): InAppNotificationFilter {
  const filter: InAppNotificationFilter = { page: readPageParam(params), pageSize: PAGE_SIZE };

  if (params.get(SearchParamEnum.STATUS)?.trim().toLowerCase() === UNREAD) filter.isRead = false;

  const type = parseNotificationType(params.get(SearchParamEnum.TYPE));
  if (type) filter.type = type;

  return filter;
}

function toParams(filter: InAppNotificationFilter): Record<string, string> {
  const params: Record<string, string> = {};

  writePageParam(params, filter.page);
  if (filter.isRead === false) params[SearchParamEnum.STATUS] = UNREAD;
  if (filter.type) params[SearchParamEnum.TYPE] = notificationTypeSlug(filter.type);

  return params;
}

export const notificationSearchCodec: SearchQueryCodec<InAppNotificationFilter> = {
  fromParams,
  toParams,
};
