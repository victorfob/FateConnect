import type { SearchQueryCodec } from '@app/hooks/useSearchQuery';
import {
  denunciationStatusSlug,
  parseDenunciationStatus,
} from '@app/services/denunciations/denunciationStatus';
import type { DenunciationFilter } from '@app/services/denunciations/types';
import { PAGE_SIZE, readPageParam, writePageParam } from '@app/utils/searchParams';

enum SearchParamEnum {
  STATUS = 'situacao',
}

/**
 * A lista abre em todas as situações, então a ausência do parâmetro já é o
 * padrão: não há palavra para pedir todas, como o mural de achados precisa.
 */
function fromParams(params: URLSearchParams): DenunciationFilter {
  const filter: DenunciationFilter = { page: readPageParam(params), pageSize: PAGE_SIZE };

  const status = parseDenunciationStatus(params.get(SearchParamEnum.STATUS));
  if (status) filter.status = status;

  return filter;
}

function toParams(filter: DenunciationFilter): Record<string, string> {
  const params: Record<string, string> = {};

  writePageParam(params, filter.page);
  if (filter.status) params[SearchParamEnum.STATUS] = denunciationStatusSlug(filter.status);

  return params;
}

export const denunciationSearchCodec: SearchQueryCodec<DenunciationFilter> = {
  fromParams,
  toParams,
};
