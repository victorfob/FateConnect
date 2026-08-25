import { mobileMedia, spacingScale, Stack, styled } from '@design-system';

const { xs, md, xl } = spacingScale;

export const DetailsRow = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.space(xl),

  [mobileMedia]: { flexDirection: 'column', alignItems: 'center', gap: theme.space(md) },
}));

/** Quem é a pessoa: o círculo com as iniciais e o nome embaixo dele. */
export const Identity = styled(Stack)(({ theme }) => ({
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.space(xs),
}));

export const Channels = styled(Stack)(({ theme }) => ({
  flexDirection: 'column',
  gap: theme.space(xs),

  [mobileMedia]: { alignItems: 'center' },
}));
