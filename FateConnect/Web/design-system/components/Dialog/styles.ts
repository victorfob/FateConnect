import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { styled, type CSSObject } from '@ds-root/styled';
import { spacingScale } from '@ds-root/tokens';

const { sm, md, lg, xl } = spacingScale;

/**
 * Recuo do botão mais a margem interna da arte do ícone. Sem descontar os dois,
 * o desenho do X fica aquém da borda dos campos, e o olho acusa.
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

  // Em tela cheia a superfície ocupa a altura toda, e o rodapé desce ao pé dela.
  [theme.breakpoints.down('md')]: {
    flexGrow: 1,
    padding: theme.space(md),

    // Sem formulário, o conteúdo é curto: ele vai para o meio da tela e os botões
    // dividem a largura. O formulário fica no topo, longe do teclado.
    '&:not(:has(form))': {
      '& [data-dialog-body]': { justifyContent: 'safe center' },
      '& [data-dialog-footer] .MuiButton-root': { flex: 1 },
    },

    '&:has(form) [data-close-footer], &:has([data-dialog-footer]:not([data-close-footer] *)) [data-close-footer]':
      { display: 'none' },
  },
}));

/**
 * O "Fechar" do pé só existe no estreito, e a superfície o esconde quando o
 * diálogo traz rodapé ou formulário: sem ele, o X seria a única saída da tela.
 */
export const CloseFooterSlot = styled(Stack)(({ theme }) => ({
  display: 'none',

  [theme.breakpoints.down('md')]: { display: 'flex' },
}));

/** Título e o fechar dividem a linha; o título ocupa o resto dela. */
export const TitleRow = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.space(sm),
}));

/**
 * Só existe abaixo do breakpoint mobile, onde o diálogo ocupa a tela inteira e
 * não sobra onde tocar fora dele. O `display: none` da base é o que o mantém
 * fora do desktop, que segue sem botão de fechar.
 */
export const CloseButtonSlot = styled(Stack)(({ theme }) => ({
  display: 'none',
  // Puxa o botão para fora da linha para o **desenho** do X cair na borda dos
  // campos: é a caixa dele que encosta primeiro.
  marginRight: `-${CLOSE_GLYPH_OFFSET_PX}px`,

  [theme.breakpoints.down('md')]: { display: 'flex' },
}));

/** No estreito o título divide a linha com o fechar; o texto do diálogo o acompanha. */
export function alignedWithTitle(theme: Theme): CSSObject {
  return {
    textAlign: 'center',

    [theme.breakpoints.down('md')]: { textAlign: 'left' },
  };
}

export const DialogTitleText = styled(Typography)(({ theme }) => ({
  flex: 1,
  ...alignedWithTitle(theme),
}));
