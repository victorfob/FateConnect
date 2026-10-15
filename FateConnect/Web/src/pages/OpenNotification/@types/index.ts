import type { InAppNotification } from '@app/services/inAppNotifications/types';

export type PushedNotification = Pick<InAppNotification, 'id' | 'type' | 'referenceId'>;
