import type { SearchQueryCodec } from '@app/hooks/useSearchQuery';
import { TAB_PARAM } from '@app/pages/Management/helpers/searchQuery';
import { ManagementTabEnum } from '@app/pages/Management/types';
import type { UserFilter } from '@app/services/users/managementTypes';
import { PAGE_SIZE, readPageParam, readParamValue, writePageParam } from '@app/utils/searchParams';

import { accountStatusSlug, parseAccountStatus } from './accountStatus';
import { parseProfileType, profileTypeSlug } from './profileType';

enum SearchParamEnum {
  SEARCH = 'busca',
  STATUS = 'situacao',
  PROFILE = 'perfil',
}

function fromParams(params: URLSearchParams): UserFilter {
  const filter: UserFilter = { page: readPageParam(params), pageSize: PAGE_SIZE };

  const search = readParamValue(params, SearchParamEnum.SEARCH);
  if (search) filter.search = search;

  const status = parseAccountStatus(params.get(SearchParamEnum.STATUS));
  if (status) filter.status = status;

  const profileType = parseProfileType(params.get(SearchParamEnum.PROFILE));
  if (profileType) filter.profileType = profileType;

  return filter;
}

/** A aba vai junto pelo mesmo motivo da de denúncias: o `useSearchQuery` troca a busca inteira. */
function toParams(filter: UserFilter): Record<string, string> {
  const params: Record<string, string> = { [TAB_PARAM]: ManagementTabEnum.USERS };

  writePageParam(params, filter.page);
  if (filter.search) params[SearchParamEnum.SEARCH] = filter.search;
  if (filter.status) params[SearchParamEnum.STATUS] = accountStatusSlug(filter.status);
  if (filter.profileType) params[SearchParamEnum.PROFILE] = profileTypeSlug(filter.profileType);

  return params;
}

export const managementUserCodec: SearchQueryCodec<UserFilter> = { fromParams, toParams };
