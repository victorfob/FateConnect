import type { SearchQueryCodec } from '@app/hooks/useSearchQuery';
import type { RideFilter } from '@app/services/rides/types';

import { parseRideType, rideTypeSlug } from './rideType';

export const FIRST_PAGE = 1;
export const PAGE_SIZE = 10;

enum SearchParamEnum {
  PAGE = 'pagina',
  DESTINATION = 'destino',
  DEPARTURE_DATE = 'data',
  DEPARTURE_TIME = 'hora',
  RIDE_TYPE = 'tipo',
}

function readPage(raw: string | null): number {
  const parsed = Number.parseInt(raw ?? '', 10);

  if (!Number.isFinite(parsed) || parsed < FIRST_PAGE) return FIRST_PAGE;

  return parsed;
}

function fromParams(params: URLSearchParams): RideFilter {
  const filter: RideFilter = {
    page: readPage(params.get(SearchParamEnum.PAGE)),
    pageSize: PAGE_SIZE,
  };

  const destination = params.get(SearchParamEnum.DESTINATION)?.trim();
  if (destination) filter.destination = destination;

  const departureDate = params.get(SearchParamEnum.DEPARTURE_DATE)?.trim();
  if (departureDate) filter.departureDate = departureDate;

  const departureTime = params.get(SearchParamEnum.DEPARTURE_TIME)?.trim();
  if (departureTime) filter.departureTime = departureTime;

  const rideType = parseRideType(params.get(SearchParamEnum.RIDE_TYPE));
  if (rideType) filter.rideType = rideType;

  return filter;
}

function toParams(filter: RideFilter): Record<string, string> {
  const params: Record<string, string> = {};

  // A página 1 e o tamanho fixo são o padrão, e padrão não ocupa a URL.
  if (filter.page && filter.page > FIRST_PAGE) params[SearchParamEnum.PAGE] = String(filter.page);
  if (filter.destination) params[SearchParamEnum.DESTINATION] = filter.destination;
  if (filter.departureDate) params[SearchParamEnum.DEPARTURE_DATE] = filter.departureDate;
  if (filter.departureTime) params[SearchParamEnum.DEPARTURE_TIME] = filter.departureTime;
  if (filter.rideType) params[SearchParamEnum.RIDE_TYPE] = rideTypeSlug(filter.rideType);

  return params;
}

export const rideSearchCodec: SearchQueryCodec<RideFilter> = { fromParams, toParams };
