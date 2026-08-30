import { useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import type { PagedResult, PageQuery } from '@app/services/types';
import { FIRST_PAGE, PAGE_SIZE } from '@app/utils/searchParams';

import { useSearchQuery, type SearchQueryCodec } from './useSearchQuery';

const NO_PAGES = 0;

export type PagedSearchInput<TFilter, TItem> = Readonly<{
  codec: SearchQueryCodec<TFilter>;
  queryKey: string;
  listFunction: (filters: TFilter) => Promise<PagedResult<TItem>>;
  errorMessage: string;
}>;

export type PagedSearchResult<TFilter, TItem> = Readonly<{
  filters: TFilter;
  items: TItem[];
  totalPages: number;
  currentPage: number;
  isPending: boolean;
  applyFilters: (applied: TFilter) => void;
  changePage: (nextPage: number) => void;
}>;

/**
 * A busca de uma lista paginada: os filtros moram no endereço, a página vem da
 * API e as duas coisas andam juntas. A query fica aqui dentro porque a correção
 * de página fora do intervalo precisa do total, que só a resposta traz.
 */
export function usePagedSearch<TFilter extends PageQuery, TItem>({
  codec,
  queryKey,
  listFunction,
  errorMessage,
}: PagedSearchInput<TFilter, TItem>): PagedSearchResult<TFilter, TItem> {
  const { value: filters, replace } = useSearchQuery(codec);

  const { data, isPending } = useQuery({
    queryKey: [queryKey, filters],
    queryFn: () => listFunction(filters),
    meta: { errorMessage },
  });

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? NO_PAGES;
  const currentPage = filters.page ?? FIRST_PAGE;

  // Quem salvou `?pagina=7` e voltou depois de a lista encolher veria uma página
  // vazia, que parece defeito. Cai na última existente e a URL acompanha.
  useEffect(() => {
    if (totalPages === NO_PAGES || currentPage <= totalPages) return;

    replace({ ...filters, page: totalPages });
  }, [currentPage, filters, replace, totalPages]);

  // Filtrar refaz a busca, então a página volta a ser a primeira.
  const applyFilters = useCallback(
    (applied: TFilter) => replace({ ...applied, page: FIRST_PAGE, pageSize: PAGE_SIZE }),
    [replace],
  );

  const changePage = useCallback(
    (nextPage: number) => replace({ ...filters, page: nextPage }),
    [filters, replace],
  );

  return { filters, items, totalPages, currentPage, isPending, applyFilters, changePage };
}
