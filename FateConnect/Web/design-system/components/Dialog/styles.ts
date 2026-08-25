import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { styled } from '@ds-root/styled';
import { spacingScale } from '@ds-root/tokens';

const { lg, xl } = spacingScale;

export const DialogSurface = styled(Stack)(({ theme }) => ({
  flexDirection: 'column',
  gap: theme.space(lg),
  padding: theme.space(xl),
  // O miolo é quem rola quando o conteúdo passa da tela; sem isto o recuo do
  // diálogo rolaria junto e o título sairia de vista.
  minHeight: 0,
  overflow: 'hidden',
}));

export const DialogTitleText = styled(Typography)({
  textAlign: 'center',
});
