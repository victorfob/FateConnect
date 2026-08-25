import Stack from '@mui/material/Stack';

import { styled, type PolymorphicProps } from '@ds-root/styled';
import { spacing } from '@ds-root/theme/helpers/spacing';
import { spacingScale } from '@ds-root/tokens';

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
