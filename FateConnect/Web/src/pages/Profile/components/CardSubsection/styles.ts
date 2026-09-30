import { spacingScale, Stack, styled } from '@design-system';

const { md } = spacingScale;

export const SubsectionRoot = styled(Stack)(({ theme }) => ({
  flexDirection: 'column',
  gap: theme.space(md),

  // Somado ao vão do cartão, separa uma subseção da outra mais do que o título dos campos.
  '& + &': { marginTop: theme.space(md) },
}));
