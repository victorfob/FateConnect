import { spacingScale, Stack, styled, Typography } from '@design-system';

const { xs, sm } = spacingScale;

export const PhotoCardContent = styled(Stack)(({ theme }) => ({
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.space(sm),
  textAlign: 'center',
}));

/** Lado a lado quando cabem; senão, um sob o outro, os dois com a largura do cartão. */
export const PhotoActions = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'center',
  alignSelf: 'stretch',
  gap: theme.space(xs),

  '& .MuiButton-root': { flex: '1 1 max-content' },
}));

export const PhotoHint = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

export const PhotoError = styled(Typography)(({ theme }) => ({
  color: theme.palette.error.main,
}));
