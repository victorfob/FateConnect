import Box from '@mui/material/Box';
import { PickerDay } from '@mui/x-date-pickers';

import { styled, type CSSObject } from '@ds-root/styled';
import { radiusScale, spacingScale } from '@ds-root/tokens';

import type { DayBandShape } from '../types';

const { none } = spacingScale;
const { md } = radiusScale;

/** O dia mede 36px e leva 2px de margem de cada lado, então o passo é 40px. */
const DAY_SIZE_PX = 36;
const DAY_MARGIN_PX = 2;
const CELL_PITCH_PX = DAY_SIZE_PX + DAY_MARGIN_PX + DAY_MARGIN_PX;

const HALF_CELL = '50%';
const CELL_EDGE = '0';

/**
 * Onde a faixa começa e termina dentro da célula. Na ponta ela cobre **meia**
 * célula, do centro do quadrado para o lado do período: é isso que a emenda com
 * a célula vizinha sem deixar vão, já que as células se tocam.
 */
const BAND_INSET: Readonly<Record<DayBandShape, { left: string; right: string }>> = {
  outside: { left: CELL_EDGE, right: CELL_EDGE },
  inside: { left: CELL_EDGE, right: CELL_EDGE },
  start: { left: HALF_CELL, right: CELL_EDGE },
  end: { left: CELL_EDGE, right: HALF_CELL },
  only: { left: CELL_EDGE, right: CELL_EDGE },
};

/** A célula é dona do passo inteiro, e a faixa vive atrás do dia. */
export const DayCell = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'band',
})<{ band: DayBandShape }>(({ theme, band }) => {
  const cell: CSSObject = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: `${CELL_PITCH_PX}px`,
    height: `${DAY_SIZE_PX}px`,
  };

  if (band === 'outside' || band === 'only') return cell;

  return {
    ...cell,
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: BAND_INSET[band].left,
      right: BAND_INSET[band].right,
      background: theme.palette.dateRangeBand,
    },
  };
});

export const RangeDayButton = styled(PickerDay)(({ theme }) => ({
  // Acima da faixa, e sem a margem de fábrica: quem espaça agora é a célula.
  position: 'relative',
  margin: theme.space(none),
  borderRadius: theme.radius(md),

  // O bloco explícito é o que ganha do raio circular e do fundo que a
  // biblioteca declara para o dia escolhido.
  '&.Mui-selected': {
    background: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover, &:focus': { background: theme.palette.primary.main },
  },

  // O padrão da biblioteca marca hoje com contorno circular, que briga com o
  // quadrado das pontas.
  '&.MuiPickersDay-today': {
    border: 'none',
    fontWeight: theme.typography.fontWeightBold,
  },
}));
