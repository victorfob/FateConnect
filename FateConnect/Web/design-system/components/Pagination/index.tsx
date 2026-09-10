import { useCallback, useMemo, type ChangeEvent } from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import * as S from './styles';

const SINGLE_PAGE = 1;
/** No estreito a fileira não cabe com vizinhos: sobram as pontas e a atual. */
const NO_SIBLINGS = 0;
const DEFAULT_SIBLINGS = 1;

export type PaginationProps = Readonly<{
  /** Total de páginas. Com uma só o controle não se desenha. */
  count: number;
  /** Página atual, contada a partir de 1. */
  page: number;
  onChange: (page: number) => void;
}>;

export function Pagination({ count, page, onChange }: PaginationProps) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const siblingCount = useMemo(() => {
    if (isDesktop) return DEFAULT_SIBLINGS;

    return NO_SIBLINGS;
  }, [isDesktop]);

  const handleChange = useCallback(
    (_event: ChangeEvent<unknown>, nextPage: number) => onChange(nextPage),
    [onChange],
  );

  if (count <= SINGLE_PAGE) return null;

  return (
    <S.PaginationRoot
      count={count}
      page={page}
      onChange={handleChange}
      siblingCount={siblingCount}
    />
  );
}
