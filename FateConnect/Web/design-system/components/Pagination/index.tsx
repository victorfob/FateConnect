import { useCallback, type ChangeEvent } from 'react';

import * as S from './styles';

export type PaginationProps = Readonly<{
  /** Total de páginas. Com uma só o controle não se desenha. */
  count: number;
  /** Página atual, contada a partir de 1. */
  page: number;
  onChange: (page: number) => void;
}>;

export function Pagination({ count, page, onChange }: PaginationProps) {
  const handleChange = useCallback(
    (_event: ChangeEvent<unknown>, nextPage: number) => onChange(nextPage),
    [onChange],
  );

  if (count <= 1) return null;

  return <S.PaginationNav count={count} page={page} onChange={handleChange} />;
}
