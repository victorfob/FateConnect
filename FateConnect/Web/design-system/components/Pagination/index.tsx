import { useCallback } from 'react';

import { PAGINATION_LABEL, paginationItemLabel } from './constants';
import { pageRun, type PageSlot } from './pageRun';
import * as S from './styles';

const SINGLE_PAGE = 1;
const FIRST_PAGE = 1;
const PREVIOUS_STEP = 1;
const NEXT_STEP = 1;

export type PaginationProps = Readonly<{
  /** Total de páginas. Com uma só o controle não se desenha. */
  count: number;
  /** Página atual, contada a partir de 1. */
  page: number;
  onChange: (page: number) => void;
}>;

function slotKey(slot: PageSlot, index: number): string {
  if (typeof slot === 'number') return `page-${slot}`;

  return `${slot}-${index}`;
}

export function Pagination({ count, page, onChange }: PaginationProps) {
  const goToPrevious = useCallback(() => onChange(page - PREVIOUS_STEP), [onChange, page]);
  const goToNext = useCallback(() => onChange(page + NEXT_STEP), [onChange, page]);

  if (count <= SINGLE_PAGE) return null;

  return (
    <S.PaginationNav component="nav" aria-label={PAGINATION_LABEL}>
      <S.PaginationList component="ul">
        <S.PaginationSlot component="li">
          <S.PaginationEntry
            type="previous"
            disabled={page <= FIRST_PAGE}
            onClick={goToPrevious}
            aria-label={paginationItemLabel({ type: 'previous' })}
          />
        </S.PaginationSlot>

        {pageRun(count, page).map((slot, index) => (
          <S.PaginationSlot component="li" key={slotKey(slot, index)}>
            {typeof slot === 'number' ? (
              <S.PaginationEntry
                type="page"
                page={slot}
                selected={slot === page}
                onClick={() => onChange(slot)}
                aria-label={paginationItemLabel({
                  type: 'page',
                  page: slot,
                  selected: slot === page,
                })}
              />
            ) : (
              <S.PaginationEntry type={slot} />
            )}
          </S.PaginationSlot>
        ))}

        <S.PaginationSlot component="li">
          <S.PaginationEntry
            type="next"
            disabled={page >= count}
            onClick={goToNext}
            aria-label={paginationItemLabel({ type: 'next' })}
          />
        </S.PaginationSlot>
      </S.PaginationList>
    </S.PaginationNav>
  );
}
