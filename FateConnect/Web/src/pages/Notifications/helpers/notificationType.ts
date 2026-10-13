import { InAppNotificationTypeEnum } from '@app/services/inAppNotifications/types';

/** O filtro fala do módulo de onde o aviso vem, e não do evento. */
const TYPE_LABEL: Readonly<Record<InAppNotificationTypeEnum, string>> = {
  [InAppNotificationTypeEnum.RIDE_TO_NEIGHBORHOOD]: 'Caronas',
  [InAppNotificationTypeEnum.ITEM_ARCHIVED]: 'Achados e perdidos',
  [InAppNotificationTypeEnum.REPORT_RECEIVED]: 'Denúncias',
};

/** O que vai para a URL: o rótulo em minúsculo e sem acento. */
const TYPE_SLUG: Readonly<Record<InAppNotificationTypeEnum, string>> = {
  [InAppNotificationTypeEnum.RIDE_TO_NEIGHBORHOOD]: 'caronas',
  [InAppNotificationTypeEnum.ITEM_ARCHIVED]: 'achados-perdidos',
  [InAppNotificationTypeEnum.REPORT_RECEIVED]: 'denuncias',
};

const TYPE_VALUES: ReadonlySet<string> = new Set(Object.values(InAppNotificationTypeEnum));

export const NOTIFICATION_TYPE_OPTIONS: readonly {
  value: InAppNotificationTypeEnum;
  label: string;
}[] = Object.values(InAppNotificationTypeEnum).map((type) => ({
  value: type,
  label: TYPE_LABEL[type],
}));

export function isInAppNotificationType(value: string): value is InAppNotificationTypeEnum {
  return TYPE_VALUES.has(value);
}

export function notificationTypeSlug(value: InAppNotificationTypeEnum): string {
  return TYPE_SLUG[value];
}

export function parseNotificationType(
  raw: string | null | undefined,
): InAppNotificationTypeEnum | null {
  if (!raw) return null;

  const slug = raw.trim().toLowerCase();
  const found = Object.values(InAppNotificationTypeEnum).find((type) => TYPE_SLUG[type] === slug);

  return found ?? null;
}
