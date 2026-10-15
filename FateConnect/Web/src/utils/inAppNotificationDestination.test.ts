import { RoutePathEnum } from '@app/routes/paths';
import { InAppNotificationTypeEnum } from '@app/services/inAppNotifications/types';

import {
  archivedItemsPath,
  notificationDestination,
  rideSearchPath,
} from './inAppNotificationDestination';

describe('inAppNotificationDestination', () => {
  it('should lead to the archived items of whoever got the notice', () => {
    const url = new URL(archivedItemsPath(), 'https://fateconnect.test');

    expect(url.pathname).toBe('/achados-perdidos');
    expect(Object.fromEntries(url.searchParams)).toEqual({ meus: 'sim', situacao: 'arquivado' });
  });

  it('should lead to the rides searched by the destination, encoded', () => {
    const url = new URL(rideSearchPath('Fatec Sorocaba & Centro'), 'https://fateconnect.test');

    expect(url.pathname).toBe('/caronas');
    expect(Object.fromEntries(url.searchParams)).toEqual({ busca: 'Fatec Sorocaba & Centro' });
  });

  it('should keep the removal notice in the notifications, since what it names is gone', async () => {
    const destination = await notificationDestination({
      type: InAppNotificationTypeEnum.PUBLICATION_REMOVED,
      referenceId: 'c4a1f0d2-5b3e-4a6c-9f81-7d2e5b0a3c14',
    });

    expect(destination).toBe(RoutePathEnum.NOTIFICATIONS);
  });
});
