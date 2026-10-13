import {
  ButtonBase,
  iconSizeTokens,
  PolymorphicStack,
  radiusScale,
  spacingScale,
  Stack,
  styled,
  Typography,
} from '@design-system';

const { xxs, xs, sm } = spacingScale;

const STYLE_ONLY_PROPS: ReadonlySet<string> = new Set(['read']);

type ReadProps = { read: boolean };

const withoutReadProp = {
  shouldForwardProp: (prop: PropertyKey) => !STYLE_ONLY_PROPS.has(String(prop)),
};

type ReadStateColours = { read: string; unread: string };

/** O lido se atenua pela cor da paleta, não por opacidade: o contraste é o que o teste mede. */
function colourFor(read: boolean, { read: readColour, unread }: ReadStateColours): string {
  if (read) return readColour;

  return unread;
}

export const ItemRow = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'flex-start',
  gap: theme.space(xs),
  width: '100%',
  // O aviso traz o nome que a pessoa deu ao item e o destino que ela digitou.
  overflowWrap: 'anywhere',
}));

export const OpenArea = styled(ButtonBase)(({ theme }) => ({
  flex: 1,
  minWidth: 0,
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  gap: theme.space(sm),
  textAlign: 'left',
  borderRadius: theme.radius(radiusScale.sm),
}));

export const TypeIcon = styled(
  PolymorphicStack,
  withoutReadProp,
)<ReadProps>(({ theme, read }) => ({
  flexShrink: 0,
  paddingTop: theme.space(xxs),
  color: colourFor(read, {
    read: theme.palette.text.secondary,
    unread: theme.palette.brandText,
  }),

  '& svg': { fontSize: `${iconSizeTokens.md}px` },
}));

export const TextColumn = styled(PolymorphicStack)({ flexDirection: 'column', minWidth: 0 });

export const ItemText = styled(
  Typography,
  withoutReadProp,
)<ReadProps & { component?: 'span' }>(({ theme, read }) => ({
  display: 'block',
  color: colourFor(read, {
    read: theme.palette.text.secondary,
    unread: theme.palette.text.primary,
  }),
}));

export const Time = styled(Typography)<{ component?: 'time'; dateTime?: string }>(({ theme }) => ({
  display: 'block',
  marginTop: theme.space(xxs),
  color: theme.palette.text.secondary,
}));
