import { PolymorphicStack } from '@ds-root/polymorphic';
import { styled } from '@ds-root/styled';
import { spacingScale } from '@ds-root/tokens';

const { xxs } = spacingScale;

/**
 * Só posiciona: cor e peso são do MUI. E `inline-flex`, não `flex` — o
 * asterisco de obrigatório é irmão deste elemento, e em nível de bloco cai para
 * a linha de baixo.
 */
export const HelpLabelRow = styled(PolymorphicStack)(({ theme }) => ({
  display: 'inline-flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.space(xxs),
}));
