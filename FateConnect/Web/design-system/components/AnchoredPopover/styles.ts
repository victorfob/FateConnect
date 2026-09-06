import Popover from '@mui/material/Popover';

import { styled } from '@ds-root/styled';
import { radiusScale, spacingScale } from '@ds-root/tokens';

const { xs } = spacingScale;
const { component } = radiusScale;

const ARROW_SIZE_PX = 10;

/**
 * Até onde a seta pode chegar perto da borda do papel: metade dela mais o raio,
 * senão a ponta entra no canto arredondado e aparece cortada.
 */
const ARROW_MIN_INSET_PX = 20;

/**
 * Onde o centro do gatilho cai dentro do papel. Quem mede é o componente, na
 * abertura e a cada redimensionamento — o `50%` só vale no quadro em que a
 * medida ainda não chegou.
 */
export const ARROW_OFFSET_VARIABLE = '--anchored-popover-arrow-offset';

export const PopoverSurface = styled(Popover)(({ theme }) => ({
  '& .MuiPopover-paper': {
    marginTop: theme.space(xs),
    borderRadius: theme.radius(component),
    backgroundColor: theme.palette.surfaceFloating,
    // O papel do `Popover` nasce `overflowY: auto` e `overflowX: hidden`, e os
    // dois recortam a seta, que vive fora da caixa. Não remova por parecer
    // redundante: sem isto ela desaparece sem erro nenhum.
    overflow: 'visible',

    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      // O papel se desloca quando não cabe alinhado ao gatilho, e uma distância
      // fixa da borda dele levaria a seta junto. O `clamp` prende a ponta dentro
      // do papel quando o gatilho fica fora do alcance dela.
      left: `clamp(${ARROW_MIN_INSET_PX}px, var(${ARROW_OFFSET_VARIABLE}, 50%), calc(100% - ${ARROW_MIN_INSET_PX}px))`,
      width: `${ARROW_SIZE_PX}px`,
      height: `${ARROW_SIZE_PX}px`,
      backgroundColor: 'inherit',
      transform: 'translate(-50%, -50%) rotate(45deg)',
    },
  },
}));
