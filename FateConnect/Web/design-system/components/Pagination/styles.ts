import MuiPagination from '@mui/material/Pagination';

import { styled } from '@ds-root/styled';
import { radiusScale, spacingScale } from '@ds-root/tokens';

const { none, xxs } = spacingScale;

const ITEM_SIZE_PX = 36;

export const PaginationNav = styled(MuiPagination)(({ theme }) => ({
  '& .MuiPagination-ul': { justifyContent: 'center' },

  '& .MuiPaginationItem-root': {
    minWidth: `${ITEM_SIZE_PX}px`,
    height: `${ITEM_SIZE_PX}px`,
    margin: theme.space(none, xxs),
    borderRadius: theme.radius(radiusScale.md),
    color: theme.palette.text.primary,
  },

  // Sem repetir a classe do item, este seletor empata com o do MUI e perde no
  // desempate por ordem: o fundo do item selecionado volta ao cinza da biblioteca.
  // O `:hover` repete porque o MUI o repinta com um tom que ele deriva sozinho.
  '& .MuiPaginationItem-root.Mui-selected, & .MuiPaginationItem-root.Mui-selected:hover': {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
  },
}));
