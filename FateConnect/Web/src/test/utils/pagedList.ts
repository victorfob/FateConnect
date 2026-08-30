import { http, HttpResponse } from 'msw';

import type { PagedResult } from '@app/services/types';
import { FIRST_PAGE, PAGE_SIZE } from '@app/utils/searchParams';

/** A API casa parâmetro de query sem olhar caixa, e as telas mandam grafias diferentes. */
function lowercased(params: URLSearchParams): URLSearchParams {
  return new URLSearchParams([...params].map(([name, value]) => [name.toLowerCase(), value]));
}

function readNumber(params: URLSearchParams, key: string, fallback: number): number {
  const parsed = Number.parseInt(params.get(key) ?? '', 10);

  if (!Number.isFinite(parsed)) return fallback;

  return parsed;
}

/**
 * Fatia como a API fatia: o `total` conta o conjunto inteiro e a página além da
 * última sai vazia sem ninguém programar o caso. Stub mais tolerante que a API
 * deixa passar tela que ignora a página pedida.
 */
export function pagedResponse<T>(all: T[], url: URL): PagedResult<T> {
  const params = lowercased(url.searchParams);
  const page = readNumber(params, 'page', FIRST_PAGE);
  const pageSize = readNumber(params, 'pagesize', PAGE_SIZE);
  const start = (page - FIRST_PAGE) * pageSize;

  return {
    items: all.slice(start, start + pageSize),
    page,
    pageSize,
    total: all.length,
    totalPages: Math.ceil(all.length / pageSize),
  };
}

export function pagedListHandler<T>(path: string, all: T[], onRequest?: (url: URL) => void) {
  return http.get(path, ({ request }) => {
    const url = new URL(request.url);
    onRequest?.(url);

    return HttpResponse.json(pagedResponse(all, url));
  });
}
