import { lostItemSearchCodec } from '@app/pages/LostAndFound/helpers/searchQuery';
import { rideSearchCodec } from '@app/pages/Rides/helpers/searchQuery';
import { RoutePathEnum } from '@app/routes/paths';
import { ApiError } from '@app/services/httpClient';
import {
  InAppNotificationTypeEnum,
  type InAppNotification,
} from '@app/services/inAppNotifications/types';
import { LostItemStatusEnum } from '@app/services/lostAndFound/types';
import { getRide } from '@app/services/rides/ridesService';

const NOT_FOUND = 404;

function withQuery(path: RoutePathEnum, params: Record<string, string>): string {
  return `${path}?${new URLSearchParams(params).toString()}`;
}

/** Os itens de quem recebeu o aviso, já arquivados: é onde está o Restaurar. */
export function archivedItemsPath(): string {
  return withQuery(
    RoutePathEnum.LOST_AND_FOUND,
    lostItemSearchCodec.toParams({ onlyMine: true, status: LostItemStatusEnum.DELETED }),
  );
}

export function rideSearchPath(destination: string): string {
  return withQuery(RoutePathEnum.RIDES, rideSearchCodec.toParams({ searchTerm: destination }));
}

/** Para onde o aviso leva, da campainha ou do push; `null` é a carona que já não existe. */
export async function notificationDestination({
  type,
  referenceId,
}: Pick<InAppNotification, 'type' | 'referenceId'>): Promise<string | null> {
  if (type === InAppNotificationTypeEnum.REPORT_RECEIVED) return RoutePathEnum.REPORTS;
  if (type === InAppNotificationTypeEnum.ITEM_ARCHIVED) return archivedItemsPath();
  if (type === InAppNotificationTypeEnum.PUBLICATION_REMOVED) return RoutePathEnum.NOTIFICATIONS;
  if (!referenceId) return RoutePathEnum.RIDES;

  try {
    const ride = await getRide(referenceId);

    return rideSearchPath(ride.destination);
  } catch (error) {
    if (error instanceof ApiError && error.status === NOT_FOUND) return null;

    throw error;
  }
}
