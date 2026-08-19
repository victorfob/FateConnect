import { styled } from '@mui/material/styles';

import { spacingScale } from '@ds';

const { none } = spacingScale;

/** Casca comum aos dois layouts: ocupa a altura toda e empilha topo, conteúdo e rodapé. */
export const ShellRoot = styled('div')({
  minHeight: '100%',
  display: 'flex',
  flexDirection: 'column',
});

export const ShellContent = styled('main')(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(none),
}));
