import type { ElementType } from 'react';
import type { LinkProps } from 'react-router';
import { Button, spacingScale, Stack, styled, Typography, type FeedbackTone } from '@design-system';

const { none, xxs, xs, sm, md } = spacingScale;

type LinkedButtonProps = { component?: ElementType; to?: LinkProps['to'] };

export const Banner = styled(Stack, { shouldForwardProp: (prop) => prop !== 'tone' })<{
  tone: FeedbackTone;
}>(({ theme, tone }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.space(sm),
  padding: theme.space(xs, md),
  backgroundColor: theme.palette.feedback[tone].surface,
  color: theme.palette.feedback[tone].content,

  [theme.breakpoints.down('md')]: { alignItems: 'flex-start' },
}));

/** No estreito a ação desce para baixo da frase, que ganha a largura toda. */
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

/** Empilhada sob a frase, o recuo do botão de texto desalinharia a ação da margem dela. */
export const BannerAction = styled(Button)<LinkedButtonProps>(({ theme }) => ({
  flexShrink: 0,

  [theme.breakpoints.down('md')]: { paddingInline: theme.space(none), minWidth: 'auto' },
}));
