import type { SearchQueryCodec } from '@app/hooks/useSearchQuery';
import type { RideFilter } from '@app/services/rides/types';
import { PAGE_SIZE, readPageParam, readParamValue, writePageParam } from '@app/utils/searchParams';

import { parseRideType, rideTypeSlug } from './rideType';

enum SearchParamEnum {
  DESTINATION = 'destino',
  DEPARTURE_DATE = 'data',
  DEPARTURE_TIME = 'hora',
  RIDE_TYPE = 'tipo',
}

function fromParams(params: URLSearchParams): RideFilter {
  const filter: RideFilter = {
    page: readPageParam(params),
    pageSize: PAGE_SIZE,
  };

  const destination = readParamValue(params, SearchParamEnum.DESTINATION);
  if (destination) filter.destination = destination;

  const departureDate = readParamValue(params, SearchParamEnum.DEPARTURE_DATE);
  if (departureDate) filter.departureDate = departureDate;

  const departureTime = readParamValue(params, SearchParamEnum.DEPARTURE_TIME);
  if (departureTime) filter.departureTime = departureTime;

  const rideType = parseRideType(params.get(SearchParamEnum.RIDE_TYPE));
  if (rideType) filter.rideType = rideType;

  return filter;
}

function toParams(filter: RideFilter): Record<string, string> {
  const params: Record<string, string> = {};

  writePageParam(params, filter.page);
  if (filter.destination) params[SearchParamEnum.DESTINATION] = filter.destination;
  if (filter.departureDate) params[SearchParamEnum.DEPARTURE_DATE] = filter.departureDate;
  if (filter.departureTime) params[SearchParamEnum.DEPARTURE_TIME] = filter.departureTime;
  if (filter.rideType) params[SearchParamEnum.RIDE_TYPE] = rideTypeSlug(filter.rideType);

  return params;
}

export const rideSearchCodec: SearchQueryCodec<RideFilter> = { fromParams, toParams };
