import Stack from '@mui/material/Stack';

import { styled } from '@src-ds/styled';
import type { PolymorphicProps } from '@src-ds/styled';
import { spacing } from '@src-ds/theme/helpers/spacing';
import { spacingScale } from '@src-ds/tokens';

const { xxs } = spacingScale;

/**
 * Só posiciona: cor e peso são do MUI. E `inline-flex`, não `flex` — o
 * asterisco de obrigatório é irmão deste elemento, e em nível de bloco cai para
 * a linha de baixo.
 */
export const HelpLabelRow = styled(Stack)<PolymorphicProps>({
  display: 'inline-flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing(xxs),
});
