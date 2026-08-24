import Stack from '@mui/material/Stack';

import { styled, type PolymorphicProps } from '@src-ds/styled';
import { spacing } from '@src-ds/theme/helpers/spacing';
import { spacingScale } from '@src-ds/tokens';

const { md, xl } = spacingScale;

/** Largura da coluna de texto, como no produto. */
const CONTENT_MAX_WIDTH_REM = 28;

/** Ocupa a área de conteúdo e centraliza — papel do `:host` da tela no produto. */
export const PageMessageRoot = styled(Stack)<PolymorphicProps>({
  flexDirection: 'column',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  padding: spacing(xl),
});

export const MessageContent = styled(Stack)<PolymorphicProps>({
  flexDirection: 'column',
  maxWidth: `${CONTENT_MAX_WIDTH_REM}rem`,
  alignItems: 'center',
  gap: spacing(md),
  textAlign: 'center',
});
