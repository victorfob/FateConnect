import Box from '@mui/material/Box';

import { styled, type PolymorphicProps } from '@ds-root/styled';
import { spacing } from '@ds-root/theme/helpers/spacing';
import {
  onStatusTagSurface,
  statusTagSurface,
  type StatusTagTone,
} from '@ds-root/theme/statusTagSurface';
import { spacingScale } from '@ds-root/tokens';

const { xxs, sm } = spacingScale;

const TAG_RADIUS_PX = 12;

export const TagRoot = styled(Box)<PolymorphicProps & { tone: StatusTagTone }>(
  ({ theme, tone }) => ({
    // Elemento em linha: a caixa acompanha a altura do texto. A entrelinha
    // neutra evita que ela cresça quando o pai é um contêiner flex.
    display: 'inline',
    lineHeight: 1,
    padding: spacing(xxs, sm),
    borderRadius: `${TAG_RADIUS_PX}px`,
    background: statusTagSurface(theme, tone),
    color: onStatusTagSurface(theme, tone),
  }),
);
