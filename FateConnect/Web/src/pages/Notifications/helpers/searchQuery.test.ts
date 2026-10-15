import { InAppNotificationTypeEnum } from '@app/services/inAppNotifications/types';
import { FIRST_PAGE, PAGE_SIZE } from '@app/utils/searchParams';

import { notificationSearchCodec } from './searchQuery';

describe('notificationSearchCodec', () => {
  it('should read an empty address as every notification, on the first page', () => {
    const filter = notificationSearchCodec.fromParams(new URLSearchParams());

    expect(filter).toEqual({ page: FIRST_PAGE, pageSize: PAGE_SIZE });
  });

  it('should read the unread situation and the type the address carries, in any case', () => {
    const filter = notificationSearchCodec.fromParams(
      new URLSearchParams('situacao=Nao-Lidas&tipo=achados-perdidos&pagina=2'),
    );

    expect(filter).toEqual({
      page: 2,
      pageSize: PAGE_SIZE,
      isRead: false,
      type: InAppNotificationTypeEnum.ITEM_ARCHIVED,
    });
  });

  it('should fall back to the default when the address names values that do not exist', () => {
    const filter = notificationSearchCodec.fromParams(
      new URLSearchParams('situacao=lidas&tipo=eventos'),
    );

    expect(filter).toEqual({ page: FIRST_PAGE, pageSize: PAGE_SIZE });
  });

  it('should write the choices in Portuguese, leaving the defaults out', () => {
    expect(
      notificationSearchCodec.toParams({
        page: 3,
        isRead: false,
        type: InAppNotificationTypeEnum.RIDE_TO_NEIGHBORHOOD,
      }),
    ).toEqual({ pagina: '3', situacao: 'nao-lidas', tipo: 'caronas' });
    expect(notificationSearchCodec.toParams({ page: FIRST_PAGE })).toEqual({});
  });

  it.each(Object.values(InAppNotificationTypeEnum))('should read back the type %s', (type) => {
    const params = new URLSearchParams(notificationSearchCodec.toParams({ type }));

    expect(notificationSearchCodec.fromParams(params).type).toBe(type);
  });
});
