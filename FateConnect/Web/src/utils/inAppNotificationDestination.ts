import { lostItemSearchCodec } from '@app/pages/LostAndFound/helpers/searchQuery';
import { rideSearchCodec } from '@app/pages/Rides/helpers/searchQuery';
import { RoutePathEnum } from '@app/routes/paths';
import { LostItemStatusEnum } from '@app/services/lostAndFound/types';

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
