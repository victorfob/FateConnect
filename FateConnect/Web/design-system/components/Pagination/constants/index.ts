export type PaginationItemLabelInput = Readonly<{
  type: 'previous' | 'next' | 'page';
  page?: number;
  selected?: boolean;
}>;

/**
 * Os mesmos textos que o locale pt-BR do MUI dá ao `Pagination` pronto. Eles
 * moram aqui porque o controle monta os itens por conta própria, e o locale só
 * alcança o componente inteiro — sem isto cada botão iria ao ar sem nome para
 * quem lê por leitor de tela.
 */
export const PAGINATION_LABEL = 'Navegar pela paginação';

export function paginationItemLabel({ type, page, selected }: PaginationItemLabelInput): string {
  if (type === 'previous') return 'Ir para a página anterior';
  if (type === 'next') return 'Ir para a próxima página';
  if (selected) return `página ${page}`;

  return `Ir para a página ${page}`;
}
