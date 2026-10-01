import { spacingScale, Stack, styled } from '@design-system';

const { xs } = spacingScale;

/** A subseção já espaça o título; aqui só o botão, sem a margem da fileira dos cartões. */
export const DeactivateRow = styled(Stack)(({ theme }) => ({
  flexDirection: 'column',
  alignItems: 'stretch',

  '& .MuiButton-root': { gap: theme.space(xs) },
}));
