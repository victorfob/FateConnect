import { Box, spacingScale, styled } from '@design-system';

const { sm, md } = spacingScale;

export const FieldsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: theme.space(md),
  // Respiro para o rótulo do campo preenchido não sair cortado na rolagem.
  paddingTop: theme.space(sm),

  [theme.breakpoints.down('md')]: { gridTemplateColumns: '1fr' },
}));

export const WideCell = styled(Box)({ gridColumn: '1 / -1' });
