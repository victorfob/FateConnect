import type { SearchQueryCodec } from '@app/hooks/useSearchQuery';
import { parseReportStatus, reportStatusSlug } from '@app/services/reports/reportStatus';
import type { ReportFilter } from '@app/services/reports/types';
import { PAGE_SIZE, readPageParam, writePageParam } from '@app/utils/searchParams';

enum SearchParamEnum {
  STATUS = 'situacao',
}

/**
 * A lista abre em todas as situações, então a ausência do parâmetro já é o
 * padrão: não há palavra para pedir todas, como o mural de achados precisa.
 */
function fromParams(params: URLSearchParams): ReportFilter {
  const filter: ReportFilter = { page: readPageParam(params), pageSize: PAGE_SIZE };

  const status = parseReportStatus(params.get(SearchParamEnum.STATUS));
  if (status) filter.status = status;

  return filter;
}

function toParams(filter: ReportFilter): Record<string, string> {
  const params: Record<string, string> = {};

  writePageParam(params, filter.page);
  if (filter.status) params[SearchParamEnum.STATUS] = reportStatusSlug(filter.status);

  return params;
}

export const reportSearchCodec: SearchQueryCodec<ReportFilter> = {
  fromParams,
  toParams,
};
