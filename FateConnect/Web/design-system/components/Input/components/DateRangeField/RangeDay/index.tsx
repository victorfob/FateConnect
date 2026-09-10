import type { PickerDayProps } from '@mui/x-date-pickers';

import { dayBandShape } from '../helpers';
import type { DayBandShape, PartialDateRange } from '../types';
import * as S from './styles';

/**
 * O calendário recebe só o início como valor, então ele marca **um** dia como
 * escolhido. As pontas do período são as duas, e é aqui que a segunda ganha o
 * mesmo quadrado da primeira.
 */
const EDGE_SHAPES: ReadonlySet<DayBandShape> = new Set(['start', 'end', 'only']);

/**
 * A célula sai da árvore de acessibilidade para a fileira continuar sendo dona
 * direta do `gridcell`, que é o dia.
 */
const CELL_ROLE = 'presentation';

export type RangeDayProps = Readonly<
  PickerDayProps & {
    range: PartialDateRange;
  }
>;

export function RangeDay({ range, ...dayProps }: RangeDayProps) {
  // Dia de outro mês aparece na primeira e na última fileira: pintá-lo levaria
  // a faixa para fora do período que a pessoa escolheu.
  if (dayProps.outsideCurrentMonth)
    return (
      <S.DayCell band="outside" role={CELL_ROLE}>
        <S.RangeDayButton {...dayProps} selected={false} aria-selected={false} />
      </S.DayCell>
    );

  const band = dayBandShape(dayProps.day, range);
  // O `aria-selected` que a biblioteca manda vem do único dia que ela conhece
  // como valor, então a ponta do fim seria anunciada como não escolhida.
  const isRangeEdge = dayProps.selected || EDGE_SHAPES.has(band);

  return (
    <S.DayCell band={band} role={CELL_ROLE}>
      <S.RangeDayButton {...dayProps} selected={isRangeEdge} aria-selected={isRangeEdge} />
    </S.DayCell>
  );
}
