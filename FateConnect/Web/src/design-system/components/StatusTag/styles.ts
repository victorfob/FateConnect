import Box from '@mui/material/Box';

import { styled } from '../../styled';
import type { PolymorphicProps } from '../../styled';
import { spacing } from '../../theme/helpers/spacing';
import { spacingScale } from '../../tokens';
import type { StatusTagTone } from './types';

const { xxs, sm } = spacingScale;

const TAG_RADIUS_PX = 12;

export const TagRoot = styled(Box)<PolymorphicProps & { tone: StatusTagTone }>(({
  theme,
  tone,
}) => {
  const tones: Record<StatusTagTone, { background: string; color: string }> = {
    success: { background: theme.palette.success.light, color: theme.palette.success.main },
    warning: { background: theme.palette.warning.light, color: theme.palette.warning.main },
    neutral: { background: 'transparent', color: 'inherit' },
  };

  return {
    // Elemento em linha: a caixa acompanha a altura do texto. A entrelinha
    // neutra evita que ela cresça quando o pai é um contêiner flex.
    display: 'inline',
    lineHeight: 1,
    padding: spacing(xxs, sm),
    borderRadius: `${TAG_RADIUS_PX}px`,
    ...tones[tone],
  };
});
