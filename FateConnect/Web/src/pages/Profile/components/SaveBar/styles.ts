import { radiusScale, shadowTokens, spacingScale, Stack, styled, Typography } from '@design-system';

const { xs, sm, md, lg } = spacingScale;

/** Colada no pé enquanto o formulário rola, e parada no fim dele, sem cobrir o rodapé. */
export const SaveBarRoot = styled(Stack)(({ theme }) => ({
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
}));

export const UnsavedNotice = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.space(xs),
  marginRight: 'auto',
  color: theme.palette.text.secondary,
}));
