import type { SearchQueryCodec } from '@app/hooks/useSearchQuery';
import { LostItemStatusEnum, type LostItemFilter } from '@app/services/lostAndFound/types';
import { PAGE_SIZE, readPageParam, readParamValue, writePageParam } from '@app/utils/searchParams';

import { lostItemKindSlug, parseLostItemKind } from './lostItemKind';
import { lostItemStatusSlug, parseLostItemStatus } from './lostItemStatus';

export const DEFAULT_STATUS = LostItemStatusEnum.OPEN;

const MINE = 'sim';

enum SearchParamEnum {
  NAME = 'nome',
  OCCURRED_ON = 'data',
  KIND = 'tipo',
  STATUS = 'situacao',
  ONLY_MINE = 'meus',
}

function fromParams(params: URLSearchParams): LostItemFilter {
  const filter: LostItemFilter = {
    page: readPageParam(params),
    pageSize: PAGE_SIZE,
    // O mural abre em Aberto, então a ausência do parâmetro é essa escolha.
    status: parseLostItemStatus(params.get(SearchParamEnum.STATUS)) ?? DEFAULT_STATUS,
  };

  const searchTerm = readParamValue(params, SearchParamEnum.NAME);
  if (searchTerm) filter.searchTerm = searchTerm;

  const ocurredOn = readParamValue(params, SearchParamEnum.OCCURRED_ON);
  if (ocurredOn) filter.ocurredOn = ocurredOn;

  const kind = parseLostItemKind(params.get(SearchParamEnum.KIND));
  if (kind) filter.lostAndFoundType = kind;

  if (params.get(SearchParamEnum.ONLY_MINE)?.trim().toLowerCase() === MINE) {
    filter.onlyMyItems = true;
  }

  return filter;
}

function toParams(filter: LostItemFilter): Record<string, string> {
  const params: Record<string, string> = {};

  writePageParam(params, filter.page);
  if (filter.searchTerm) params[SearchParamEnum.NAME] = filter.searchTerm;
  if (filter.ocurredOn) params[SearchParamEnum.OCCURRED_ON] = filter.ocurredOn;
  if (filter.lostAndFoundType) {
    params[SearchParamEnum.KIND] = lostItemKindSlug(filter.lostAndFoundType);
  }
  if (filter.status && filter.status !== DEFAULT_STATUS) {
    params[SearchParamEnum.STATUS] = lostItemStatusSlug(filter.status);
  }
  if (filter.onlyMyItems) params[SearchParamEnum.ONLY_MINE] = MINE;

  return params;
}

export const lostItemSearchCodec: SearchQueryCodec<LostItemFilter> = { fromParams, toParams };
