import { parseNotificationType } from '@app/pages/Notifications/helpers/notificationType';

import type { PushedNotification } from '../@types';
import {
  NOTIFICATION_ID_PARAM,
  NOTIFICATION_REFERENCE_PARAM,
  NOTIFICATION_TYPE_PARAM,
} from '../constants';

const FIRST_NOTIFICATION_ID = 1;

export function pushedNotificationOf(params: URLSearchParams): PushedNotification | null {
  const id = Number(params.get(NOTIFICATION_ID_PARAM));
  if (!Number.isSafeInteger(id) || id < FIRST_NOTIFICATION_ID) return null;

  const type = parseNotificationType(params.get(NOTIFICATION_TYPE_PARAM));
  if (!type) return null;

  return { id, type, referenceId: params.get(NOTIFICATION_REFERENCE_PARAM) };
}
