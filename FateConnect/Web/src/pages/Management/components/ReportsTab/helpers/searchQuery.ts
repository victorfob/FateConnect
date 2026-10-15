import type { SearchQueryCodec } from '@app/hooks/useSearchQuery';
import { TAB_PARAM } from '@app/pages/Management/helpers/searchQuery';
import { ManagementTabEnum } from '@app/pages/Management/types';
import { parseReportCategory, reportCategorySlug } from '@app/pages/Reports/helpers/reportCategory';
import { parseReportStatus, reportStatusSlug } from '@app/services/reports/reportStatus';
import type { ReportFilter } from '@app/services/reports/types';
import { PAGE_SIZE, readPageParam, readParamValue, writePageParam } from '@app/utils/searchParams';

enum SearchParamEnum {
  SEARCH_TERM = 'busca',
  DATE_FROM = 'de',
  DATE_TO = 'ate',
  CATEGORY = 'motivo',
  STATUS = 'situacao',
}

function fromParams(params: URLSearchParams): ReportFilter {
  const filter: ReportFilter = { page: readPageParam(params), pageSize: PAGE_SIZE };

  const searchTerm = readParamValue(params, SearchParamEnum.SEARCH_TERM);
  if (searchTerm) filter.searchTerm = searchTerm;

  const dateFrom = readParamValue(params, SearchParamEnum.DATE_FROM);
  if (dateFrom) filter.dateFrom = dateFrom;

  const dateTo = readParamValue(params, SearchParamEnum.DATE_TO);
  if (dateTo) filter.dateTo = dateTo;

  const category = parseReportCategory(params.get(SearchParamEnum.CATEGORY));
  if (category) filter.category = category;

  const status = parseReportStatus(params.get(SearchParamEnum.STATUS));
  if (status) filter.status = status;

  return filter;
}

/**
 * ⛔ A aba vai junto: o `useSearchQuery` substitui a busca inteira, e sem ela
 * paginar ou filtrar apagaria do endereço a aba em que a pessoa está.
 */
function toParams(filter: ReportFilter): Record<string, string> {
  const params: Record<string, string> = { [TAB_PARAM]: ManagementTabEnum.REPORTS };

  writePageParam(params, filter.page);
  if (filter.searchTerm) params[SearchParamEnum.SEARCH_TERM] = filter.searchTerm;
  if (filter.dateFrom) params[SearchParamEnum.DATE_FROM] = filter.dateFrom;
  if (filter.dateTo) params[SearchParamEnum.DATE_TO] = filter.dateTo;
  if (filter.category) params[SearchParamEnum.CATEGORY] = reportCategorySlug(filter.category);
  if (filter.status) params[SearchParamEnum.STATUS] = reportStatusSlug(filter.status);

  return params;
}

export const managementReportCodec: SearchQueryCodec<ReportFilter> = {
  fromParams,
  toParams,
};
