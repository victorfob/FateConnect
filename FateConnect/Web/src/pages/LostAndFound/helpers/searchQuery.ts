import type { SearchQueryCodec } from '@app/hooks/useSearchQuery';
import { LostItemStatusEnum, type LostItemFilter } from '@app/services/lostAndFound/types';
import { PAGE_SIZE, readPageParam, readParamValue, writePageParam } from '@app/utils/searchParams';

import { lostItemKindSlug, parseLostItemKind } from './lostItemKind';
import { lostItemStatusSlug, parseLostItemStatus } from './lostItemStatus';

export const DEFAULT_STATUS = LostItemStatusEnum.OPEN;

const MINE = 'sim';

/** A ausência do parâmetro já é o padrão do mural, então pedir todas precisa de palavra própria. */
const EVERY_STATUS = 'todas';

enum SearchParamEnum {
  SEARCH_TERM = 'busca',
  DATE_FROM = 'de',
  DATE_TO = 'ate',
  KIND = 'tipo',
  STATUS = 'situacao',
  ONLY_MINE = 'meus',
}

/** Filtro sem situação é o pedido por todas elas, que é como a API as devolve. */
function readStatus(params: URLSearchParams): LostItemStatusEnum | undefined {
  const raw = params.get(SearchParamEnum.STATUS)?.trim().toLowerCase();

  if (raw === EVERY_STATUS) return undefined;

  // O mural abre em Aberto, então a ausência do parâmetro é essa escolha.
  return parseLostItemStatus(raw) ?? DEFAULT_STATUS;
}

function fromParams(params: URLSearchParams): LostItemFilter {
  const filter: LostItemFilter = {
    page: readPageParam(params),
    pageSize: PAGE_SIZE,
  };

  const status = readStatus(params);
  if (status) filter.status = status;

  const searchTerm = readParamValue(params, SearchParamEnum.SEARCH_TERM);
  if (searchTerm) filter.searchTerm = searchTerm;

  const dateFrom = readParamValue(params, SearchParamEnum.DATE_FROM);
  if (dateFrom) filter.dateFrom = dateFrom;

  const dateTo = readParamValue(params, SearchParamEnum.DATE_TO);
  if (dateTo) filter.dateTo = dateTo;

  const kind = parseLostItemKind(params.get(SearchParamEnum.KIND));
  if (kind) filter.lostAndFoundType = kind;

  if (params.get(SearchParamEnum.ONLY_MINE)?.trim().toLowerCase() === MINE) filter.onlyMine = true;

  return filter;
}

function toParams(filter: LostItemFilter): Record<string, string> {
  const params: Record<string, string> = {};

  writePageParam(params, filter.page);
  if (filter.searchTerm) params[SearchParamEnum.SEARCH_TERM] = filter.searchTerm;
  if (filter.dateFrom) params[SearchParamEnum.DATE_FROM] = filter.dateFrom;
  if (filter.dateTo) params[SearchParamEnum.DATE_TO] = filter.dateTo;
  if (filter.lostAndFoundType) {
    params[SearchParamEnum.KIND] = lostItemKindSlug(filter.lostAndFoundType);
  }
  if (!filter.status) params[SearchParamEnum.STATUS] = EVERY_STATUS;
  else if (filter.status !== DEFAULT_STATUS) {
    params[SearchParamEnum.STATUS] = lostItemStatusSlug(filter.status);
  }
  if (filter.onlyMine) params[SearchParamEnum.ONLY_MINE] = MINE;

  return params;
}

export const lostItemSearchCodec: SearchQueryCodec<LostItemFilter> = { fromParams, toParams };
