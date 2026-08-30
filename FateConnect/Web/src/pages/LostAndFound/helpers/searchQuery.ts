import type { SearchQueryCodec } from '@app/hooks/useSearchQuery';
import { LostItemStatusEnum, type LostItemFilter } from '@app/services/lostAndFound/types';

import { lostItemKindSlug, parseLostItemKind } from './lostItemKind';
import { lostItemStatusSlug, parseLostItemStatus } from './lostItemStatus';

export const FIRST_PAGE = 1;
export const PAGE_SIZE = 10;
export const DEFAULT_STATUS = LostItemStatusEnum.OPEN;

const MINE = 'sim';

enum SearchParamEnum {
  PAGE = 'pagina',
  NAME = 'nome',
  OCCURRED_ON = 'data',
  KIND = 'tipo',
  STATUS = 'situacao',
  ONLY_MINE = 'meus',
}

function readPage(raw: string | null): number {
  const parsed = Number.parseInt(raw ?? '', 10);

  if (!Number.isFinite(parsed) || parsed < FIRST_PAGE) return FIRST_PAGE;

  return parsed;
}

function fromParams(params: URLSearchParams): LostItemFilter {
  const filter: LostItemFilter = {
    page: readPage(params.get(SearchParamEnum.PAGE)),
    pageSize: PAGE_SIZE,
    // O mural abre em Aberto, então a ausência do parâmetro é essa escolha.
    status: parseLostItemStatus(params.get(SearchParamEnum.STATUS)) ?? DEFAULT_STATUS,
  };

  const name = params.get(SearchParamEnum.NAME)?.trim();
  if (name) filter.name = name;

  const occurredOn = params.get(SearchParamEnum.OCCURRED_ON)?.trim();
  if (occurredOn) filter.occurredOn = occurredOn;

  const kind = parseLostItemKind(params.get(SearchParamEnum.KIND));
  if (kind) filter.kind = kind;

  if (params.get(SearchParamEnum.ONLY_MINE)?.trim().toLowerCase() === MINE) filter.onlyMine = true;

  return filter;
}

function toParams(filter: LostItemFilter): Record<string, string> {
  const params: Record<string, string> = {};

  if (filter.page && filter.page > FIRST_PAGE) params[SearchParamEnum.PAGE] = String(filter.page);
  if (filter.name) params[SearchParamEnum.NAME] = filter.name;
  if (filter.occurredOn) params[SearchParamEnum.OCCURRED_ON] = filter.occurredOn;
  if (filter.kind) params[SearchParamEnum.KIND] = lostItemKindSlug(filter.kind);
  if (filter.status && filter.status !== DEFAULT_STATUS) {
    params[SearchParamEnum.STATUS] = lostItemStatusSlug(filter.status);
  }
  if (filter.onlyMine) params[SearchParamEnum.ONLY_MINE] = MINE;

  return params;
}

export const lostItemSearchCodec: SearchQueryCodec<LostItemFilter> = { fromParams, toParams };
