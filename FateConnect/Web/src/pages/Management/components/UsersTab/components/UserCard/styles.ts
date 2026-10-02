import { spacingScale, Stack, styled } from '@design-system';

const { sm } = spacingScale;

export const Identity = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.space(sm),

  // O nome é quem encolhe e quebra; o círculo mantém o diâmetro.
  '& > :last-child': { minWidth: 0 },
}));
