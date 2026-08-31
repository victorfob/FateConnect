const FIRST_PAGE = 1;
const NEXT = 1;

/** Quantos números aparecem entre a primeira e a última página. */
const WINDOW = 4;
/** A primeira e a última, que aparecem sempre. */
const BOUNDARIES = 2;
/** Acima disto a fileira precisa de reticências para caber numa linha só. */
const FITS_WHOLE = WINDOW + BOUNDARIES;
/**
 * Quantas páginas de cada ponta a corrida da borda cobre. Fora delas a página
 * atual ficaria encostada nas reticências, sem vizinho numérico para onde ir.
 */
const EDGE_RUN = WINDOW - NEXT;

export type PageSlot = number | 'start-ellipsis' | 'end-ellipsis';

const range = (start: number, end: number): number[] =>
  Array.from({ length: end - start + NEXT }, (_item, index) => start + index);

/**
 * Seis itens no máximo, para que o controle inteiro — com as duas setas — caiba
 * numa fileira de oito na largura de um celular.
 *
 * As duas pontas usam a mesma medida: `EDGE_RUN` páginas colam na borda, e o
 * resto cai na janela do meio, que mostra a atual e a **seguinte**. Contar as
 * pontas com medidas diferentes foi o defeito da primeira versão — a página 4
 * ficava sem número à frente, e a 9 sem número atrás.
 */
export function pageRun(count: number, page: number): PageSlot[] {
  if (count <= FITS_WHOLE) return range(FIRST_PAGE, count);

  const fromStart = page - FIRST_PAGE;
  const fromEnd = count - page;

  if (fromStart < EDGE_RUN) return [...range(FIRST_PAGE, WINDOW), 'end-ellipsis', count];
  if (fromEnd < EDGE_RUN) {
    return [FIRST_PAGE, 'start-ellipsis', ...range(count - WINDOW + NEXT, count)];
  }

  return [FIRST_PAGE, 'start-ellipsis', page, page + NEXT, 'end-ellipsis', count];
}
