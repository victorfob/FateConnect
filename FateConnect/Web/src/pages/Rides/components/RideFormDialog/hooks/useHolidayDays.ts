import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';

import { listHolidays } from '@app/services/holidays/holidaysService';

import { HOLIDAYS_LOAD_FAILED, HOLIDAYS_QUERY_KEY } from '../constants';

/** Os feriados dos anos pedidos, em `aaaa-mm-dd`, prontos para consultar dia a dia. */
export function useHolidayDays(years: readonly number[], enabled: boolean): ReadonlySet<string> {
  const holidays = useQueries({
    queries: years.map((year) => ({
      queryKey: [HOLIDAYS_QUERY_KEY, year],
      queryFn: () => listHolidays(year),
      enabled,
      staleTime: Infinity,
      meta: { errorMessage: HOLIDAYS_LOAD_FAILED },
    })),
    combine: (results) => results.flatMap((result) => result.data ?? []),
  });

  return useMemo(() => new Set(holidays), [holidays]);
}
