import type { ElementType } from 'react';
import type { LinkProps } from 'react-router';
import { Button, spacingScale, Stack, styled, Typography } from '@design-system';

const { none, xxs, xs, sm, md } = spacingScale;

type LinkedButtonProps = { component?: ElementType; to: LinkProps['to'] };

export const Banner = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.space(sm),
  padding: theme.space(xs, md),
  backgroundColor: theme.palette.notification.warning.surface,
  color: theme.palette.notification.warning.content,

  [theme.breakpoints.down('md')]: { alignItems: 'flex-start' },
}));

/** No estreito o link desce para baixo da frase, que ganha a largura toda. */
export const BannerContent = styled(Stack)(({ theme }) => ({
  flex: 1,
  minWidth: 0,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.space(sm),

  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.space(xxs),
  },
}));

export const BannerText = styled(Typography)({ minWidth: 0 });

/** Empilhado sob a frase, o recuo do botão de texto desalinharia o link da margem dela. */
export const RegisterContactsLink = styled(Button)<LinkedButtonProps>(({ theme }) => ({
  flexShrink: 0,

  [theme.breakpoints.down('md')]: { paddingInline: theme.space(none), minWidth: 'auto' },
}));
