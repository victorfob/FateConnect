import Stack from '@mui/material/Stack';

import { styled } from '@ds-root/styled';
import { spacingScale } from '@ds-root/tokens';

const { xxs, sm, md } = spacingScale;

export const InfoRow = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  flexWrap: 'wrap',
  columnGap: theme.space(md),
  rowGap: theme.space(xxs),
  marginBottom: theme.space(sm),
  // Cada item desenha a barra à sua esquerda, dentro do vão. É este recorte que
  // apaga a do primeiro item de cada linha — inclusive a da linha que quebrou.
  overflow: 'hidden',
  color: theme.palette.text.secondary,

  // No estreito, um por linha: em linha a quebra dependeria do tamanho do
  // texto, e o item que descesse sozinho pareceria solto.
  [theme.breakpoints.down('md')]: { flexDirection: 'column' },
}));
