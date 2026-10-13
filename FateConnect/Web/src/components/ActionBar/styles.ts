import { radiusScale, shadowTokens, spacingScale, Stack, styled } from '@design-system';

const { xs, sm, md, lg } = spacingScale;

/** Colada no pé enquanto a tela rola, e parada no fim do conteúdo, sem cobrir o rodapé. */
export const ActionBarRoot = styled(Stack)(({ theme }) => ({
  position: 'sticky',
  bottom: 0,
  zIndex: theme.zIndex.appBar,
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: theme.space(sm),
  padding: theme.space(md, lg),
  backgroundColor: theme.palette.surfaceFloating,
  boxShadow: shadowTokens.floating,
  borderRadius: theme.radius(radiusScale.component),

  '& .MuiButton-root': { gap: theme.space(xs) },

  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
}));
