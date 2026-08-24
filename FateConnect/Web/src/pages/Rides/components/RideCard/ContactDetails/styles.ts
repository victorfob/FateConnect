import {
  mobileMedia,
  spacing,
  spacingScale,
  Stack,
  styled,
  type PolymorphicProps,
} from '@design-system';

const { xs, md, xl } = spacingScale;

export const DetailsRow = styled(Stack)<PolymorphicProps>({
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing(xl),

  [mobileMedia]: { flexDirection: 'column', alignItems: 'center', gap: spacing(md) },
});

/** Quem é a pessoa: o círculo com as iniciais e o nome embaixo dele. */
export const Identity = styled(Stack)<PolymorphicProps>({
  flexDirection: 'column',
  alignItems: 'center',
  gap: spacing(xs),
});

export const Channels = styled(Stack)<PolymorphicProps>({
  flexDirection: 'column',
  gap: spacing(xs),

  [mobileMedia]: { alignItems: 'center' },
});
