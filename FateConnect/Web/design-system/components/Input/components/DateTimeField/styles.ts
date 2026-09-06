import Popover from '@mui/material/Popover';

import { styled } from '@ds-root/styled';
import { typographyTokens } from '@ds-root/tokens';

/**
 * O seletor traz o próprio recuo; o papel só o emoldura.
 *
 * As duas sobrescritas moram aqui, e não no tema, porque a biblioteca desenha
 * esses elementos sem gancho de `styleOverrides`.
 */
export const PickerPopover = styled(Popover)(({ theme }) => ({
  '& .MuiPickersLayout-root': { backgroundColor: theme.palette.background.paper },

  // O título vem em `overline`, que é caixa alta e não é escala nossa.
  '& .MuiPickersToolbar-title': { ...typographyTokens.caption, textTransform: 'none' },

  // O dia sai em `h4` e a hora em `h3`, dois tamanhos que não são nossos e que
  // fazem o valor competir com o título do diálogo atrás do painel.
  '& .MuiDateTimePickerToolbar-dateContainer .MuiTypography-root, & .MuiDateTimePickerToolbar-timeDigitsContainer .MuiTypography-root':
    typographyTokens.h2,

  // Aba, dígito do topo e ação saem na cor primária, que no tema escuro é a
  // superfície do cromo: como texto ela dá 4,11:1, abaixo dos 4,5:1 que a WCAG
  // pede. O texto passa a ler a cor de texto, e o destaque sobrevive onde o
  // limite é 3:1 — o traço da aba ativa e o dia escolhido.
  '& .MuiTab-root.Mui-selected, & .MuiPickersToolbar-root .MuiButton-root, & .MuiPickersLayout-actionBar .MuiButton-root':
    { color: theme.palette.text.primary },
}));
