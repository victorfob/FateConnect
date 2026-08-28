import MuiPagination from '@mui/material/Pagination';

import { styled } from '@ds-root/styled';
import { radiusScale, shadowTokens, spacingScale } from '@ds-root/tokens';

const { none, xxs } = spacingScale;

const ITEM_SIZE_PX = 36;

/**
 * Os pontos das reticências repousam na linha de base e os dígitos sobem a
 * partir dela, então centralizar as duas caixas deixa a tinta em alturas
 * diferentes. Este é metade da diferença entre as duas alturas de tinta, em
 * `em` para acompanhar o tamanho da fonte.
 */
const ELLIPSIS_INK_OFFSET = '0.3em';

export const PaginationNav = styled(MuiPagination)(({ theme }) => ({
  '& .MuiPagination-ul': { justifyContent: 'center' },

  '& .MuiPaginationItem-root': {
    minWidth: `${ITEM_SIZE_PX}px`,
    height: `${ITEM_SIZE_PX}px`,
    margin: theme.space(none, xxs),
    borderRadius: theme.radius(radiusScale.md),
    color: theme.palette.text.primary,
  },

  // As reticências ficam de fora: no protótipo elas repousam sobre o fundo da
  // página, e só os itens em que se clica são cartão.
  '& .MuiPaginationItem-page, & .MuiPaginationItem-previousNext': {
    backgroundColor: theme.palette.background.paper,
    boxShadow: shadowTokens.component,
  },

  '& .MuiPaginationItem-ellipsis': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transform: `translateY(-${ELLIPSIS_INK_OFFSET})`,
  },

  // Sem repetir a classe do item, este seletor empata com o do MUI e perde no
  // desempate por ordem: o fundo do item selecionado volta ao cinza da biblioteca.
  // O `:hover` repete porque o MUI o repinta com um tom que ele deriva sozinho.
  '& .MuiPaginationItem-root.Mui-selected, & .MuiPaginationItem-root.Mui-selected:hover': {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
  },
}));
