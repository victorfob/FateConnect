import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { styled } from '@ds-root/styled';
import { spacingScale } from '@ds-root/tokens';

const { sm, lg, xl } = spacingScale;

/**
 * Recuo do botão mais a margem interna da arte do ícone. Sem descontar os dois,
 * o desenho do X fica 13px aquém da borda dos campos, e o olho acusa.
 */
const CLOSE_GLYPH_OFFSET_PX = 13;

export const DialogSurface = styled(Stack)(({ theme }) => ({
  flexDirection: 'column',
  gap: theme.space(lg),
  padding: theme.space(xl),
  // O miolo é quem rola quando o conteúdo passa da tela; sem isto o recuo do
  // diálogo rolaria junto e o título sairia de vista.
  minHeight: 0,
  overflow: 'hidden',
}));

/** Título e o fechar dividem a linha; o título ocupa o resto dela. */
export const TitleRow = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.space(sm),
}));

/**
 * Só existe abaixo do breakpoint mobile, onde a faixa clicável em volta do
 * diálogo é alvo pequeno demais para o toque. O `display: none` da base é o que
 * o mantém fora do desktop, que segue sem botão de fechar.
 */
export const CloseButtonSlot = styled(Stack)(({ theme }) => ({
  display: 'none',
  // Puxa o botão para fora da linha para o **desenho** do X cair na borda dos
  // campos: é a caixa dele que encosta primeiro.
  marginRight: `-${CLOSE_GLYPH_OFFSET_PX}px`,

  [theme.breakpoints.down('md')]: { display: 'flex' },
}));

export const DialogTitleText = styled(Typography)(({ theme }) => ({
  flex: 1,
  textAlign: 'center',

  [theme.breakpoints.down('md')]: { textAlign: 'left' },
}));
