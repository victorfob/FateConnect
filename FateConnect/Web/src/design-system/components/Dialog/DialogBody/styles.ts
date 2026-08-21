import Stack from '@mui/material/Stack';

import { styled } from '../../../styled';
import type { PolymorphicProps } from '../../../styled';
import { spacing } from '../../../theme/helpers/spacing';
import { spacingScale } from '../../../tokens';

const { md } = spacingScale;

export const BodyRegion = styled(Stack)<PolymorphicProps>({
  flexDirection: 'column',
  gap: spacing(md),
  flexGrow: 1,
  // Par obrigatório do `flexGrow`: sem `minHeight: 0` o item flex se recusa a
  // encolher e a rolagem nunca acontece.
  minHeight: 0,
  overflowY: 'auto',
});
