import { PolymorphicBox } from '@ds-root/polymorphic';
import { styled } from '@ds-root/styled';
import type { StatusTagTone } from '@ds-root/theme/types';
import { spacingScale } from '@ds-root/tokens';

const { xxs, sm } = spacingScale;

const TAG_RADIUS_PX = 12;

export const TagRoot = styled(PolymorphicBox, {
  shouldForwardProp: (prop) => prop !== 'tone',
})<{ tone: StatusTagTone }>(({ theme, tone }) => ({
  // Elemento em linha: a caixa acompanha a altura do texto. A entrelinha
  // neutra evita que ela cresça quando o pai é um contêiner flex.
  display: 'inline',
  lineHeight: 1,
  padding: theme.space(xxs, sm),
  borderRadius: `${TAG_RADIUS_PX}px`,
  background: theme.palette.statusTag[tone].surface,
  color: theme.palette.statusTag[tone].content,
}));
