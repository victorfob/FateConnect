export const FIRST_PAGE = 1;
export const PAGE_SIZE = 10;

const PAGE_PARAM = 'pagina';

/** Página fora da faixa — texto, zero, negativo — cai na primeira em vez de quebrar a tela. */
export function readPageParam(params: URLSearchParams): number {
  const parsed = Number.parseInt(params.get(PAGE_PARAM) ?? '', 10);

  if (!Number.isFinite(parsed) || parsed < FIRST_PAGE) return FIRST_PAGE;

  return parsed;
}

export function writePageParam(params: Record<string, string>, page: number | undefined): void {
  // A página 1 é o padrão, e padrão não ocupa a URL.
  if (page && page > FIRST_PAGE) params[PAGE_PARAM] = String(page);
}

/** Vazio e só-espaços são ausência de filtro, não filtro por string vazia. */
export function readParamValue(params: URLSearchParams, key: string): string | undefined {
  const value = params.get(key)?.trim();

  if (!value) return undefined;

  return value;
}
