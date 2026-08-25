import Stack from '@mui/material/Stack';

import { styled } from '@ds-root/styled';
import { spacing } from '@ds-root/theme/helpers/spacing';
import { spacingScale } from '@ds-root/tokens';

const { md } = spacingScale;

export const BodyRegion = styled(Stack)({
  flexDirection: 'column',
  gap: spacing(md),
  flexGrow: 1,
  // Par obrigatório do `flexGrow`: sem `minHeight: 0` o item flex se recusa a
  // encolher e a rolagem nunca acontece.
  minHeight: 0,
  overflowY: 'auto',
});
