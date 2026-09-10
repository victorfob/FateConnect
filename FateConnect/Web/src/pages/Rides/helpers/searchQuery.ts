import type { SearchQueryCodec } from '@app/hooks/useSearchQuery';
import type { RideFilter } from '@app/services/rides/types';
import { PAGE_SIZE, readPageParam, readParamValue, writePageParam } from '@app/utils/searchParams';

import { parseRideShift, rideShiftSlug } from './rideShift';
import { parseRideType, rideTypeSlug } from './rideType';

const MINE = 'sim';

enum SearchParamEnum {
  SEARCH_TERM = 'busca',
  DATE_FROM = 'de',
  DATE_TO = 'ate',
  SHIFT = 'turno',
  RIDE_TYPE = 'tipo',
  ONLY_MINE = 'meus',
}

function fromParams(params: URLSearchParams): RideFilter {
  const filter: RideFilter = {
    page: readPageParam(params),
    pageSize: PAGE_SIZE,
  };

  const searchTerm = readParamValue(params, SearchParamEnum.SEARCH_TERM);
  if (searchTerm) filter.searchTerm = searchTerm;

  const dateFrom = readParamValue(params, SearchParamEnum.DATE_FROM);
  if (dateFrom) filter.dateFrom = dateFrom;

  const dateTo = readParamValue(params, SearchParamEnum.DATE_TO);
  if (dateTo) filter.dateTo = dateTo;

  const departureShift = parseRideShift(params.get(SearchParamEnum.SHIFT));
  if (departureShift) filter.departureShift = departureShift;

  const rideType = parseRideType(params.get(SearchParamEnum.RIDE_TYPE));
  if (rideType) filter.rideType = rideType;

  if (params.get(SearchParamEnum.ONLY_MINE)?.trim().toLowerCase() === MINE) filter.onlyMine = true;

  return filter;
}

function toParams(filter: RideFilter): Record<string, string> {
  const params: Record<string, string> = {};

  writePageParam(params, filter.page);
  if (filter.searchTerm) params[SearchParamEnum.SEARCH_TERM] = filter.searchTerm;
  if (filter.dateFrom) params[SearchParamEnum.DATE_FROM] = filter.dateFrom;
  if (filter.dateTo) params[SearchParamEnum.DATE_TO] = filter.dateTo;
  if (filter.departureShift) params[SearchParamEnum.SHIFT] = rideShiftSlug(filter.departureShift);
  if (filter.rideType) params[SearchParamEnum.RIDE_TYPE] = rideTypeSlug(filter.rideType);
  if (filter.onlyMine) params[SearchParamEnum.ONLY_MINE] = MINE;

  return params;
}

export const rideSearchCodec: SearchQueryCodec<RideFilter> = { fromParams, toParams };
