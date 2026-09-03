import Popover from '@mui/material/Popover';

import { styled } from '@ds-root/styled';
import { radiusScale, spacingScale } from '@ds-root/tokens';

const { xs } = spacingScale;
const { component } = radiusScale;

const ARROW_SIZE_PX = 10;

/** Do centro da seta até a borda direita do papel, que o `anchorOrigin` alinha
 * com a do gatilho — cai sobre o meio de um controle de 32 a 40px. */
const ARROW_CENTRE_FROM_RIGHT_PX = 18;

export const PopoverSurface = styled(Popover)(({ theme }) => ({
  '& .MuiPopover-paper': {
    marginTop: theme.space(xs),
    borderRadius: theme.radius(component),
    backgroundColor: theme.palette.background.paper,
    // O papel do `Popover` nasce `overflowY: auto` e `overflowX: hidden`, e os
    // dois recortam a seta, que vive fora da caixa. Não remova por parecer
    // redundante: sem isto ela desaparece sem erro nenhum.
    overflow: 'visible',

    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      right: `${ARROW_CENTRE_FROM_RIGHT_PX}px`,
      width: `${ARROW_SIZE_PX}px`,
      height: `${ARROW_SIZE_PX}px`,
      backgroundColor: 'inherit',
      transform: 'translate(50%, -50%) rotate(45deg)',
    },
  },
}));
