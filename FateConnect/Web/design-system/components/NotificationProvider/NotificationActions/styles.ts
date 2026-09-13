import Button from '@mui/material/Button';

import { styled } from '@ds-root/styled';
import { spacingScale, typographyTokens } from '@ds-root/tokens';

const { none, xs } = spacingScale;

/** Caixa do botão de ação no produto, herdada do botão do Material. */
const ACTION_MIN_WIDTH_PX = 64;
const ACTION_HEIGHT_PX = 36;

export const ActionButton = styled(Button)(({ theme }) => ({
  ...typographyTokens.button,
  lineHeight: 'normal',
  minWidth: `${ACTION_MIN_WIDTH_PX}px`,
  height: `${ACTION_HEIGHT_PX}px`,
  padding: theme.space(none, xs),
  color: 'inherit',
}));
