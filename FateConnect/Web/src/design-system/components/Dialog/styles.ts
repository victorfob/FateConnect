import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { styled } from '@src-ds/styled';
import type { PolymorphicProps } from '@src-ds/styled';
import { spacing } from '@src-ds/theme/helpers/spacing';
import { spacingScale } from '@src-ds/tokens';

const { lg, xl } = spacingScale;

export const DialogSurface = styled(Stack)<PolymorphicProps>({
  flexDirection: 'column',
  gap: spacing(lg),
  padding: spacing(xl),
  // O miolo é quem rola quando o conteúdo passa da tela; sem isto o recuo do
  // diálogo rolaria junto e o título sairia de vista.
  minHeight: 0,
  overflow: 'hidden',
});

/** Título centralizado em qualquer largura, ocupando a linha inteira. */
export const DialogTitleText = styled(Typography)({
  textAlign: 'center',
});
