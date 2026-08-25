import Stack from '@mui/material/Stack';

import { styled } from '@ds-root/styled';
import { spacing } from '@ds-root/theme/helpers/spacing';
import { spacingScale } from '@ds-root/tokens';

const { md, xl } = spacingScale;

/** Largura da coluna de texto, como no produto. */
const CONTENT_MAX_WIDTH_REM = 28;

/** Ocupa a área de conteúdo e centraliza — papel do `:host` da tela no produto. */
export const PageMessageRoot = styled(Stack)({
  flexDirection: 'column',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  padding: spacing(xl),
});

export const MessageContent = styled(Stack)({
  flexDirection: 'column',
  maxWidth: `${CONTENT_MAX_WIDTH_REM}rem`,
  alignItems: 'center',
  gap: spacing(md),
  textAlign: 'center',
});
