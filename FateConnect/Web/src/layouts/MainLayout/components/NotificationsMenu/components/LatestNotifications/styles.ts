import { PolymorphicStack, spacingScale, Stack, styled, Typography } from '@design-system';

import { CONTENT_ATTRIBUTE } from '@app/components/InAppNotificationItem/constants';

const { none, xxs, sm, md, lg } = spacingScale;

/** O painel é a prévia: o texto inteiro fica na central. */
const CONTENT_LINES = 2;

export const StatusArea = styled(Stack)(({ theme }) => ({
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.space(xxs),
  padding: theme.space(lg, md),
  textAlign: 'center',
}));

export const StatusDescription = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

export const NotificationList = styled(PolymorphicStack)(({ theme }) => ({
  flexDirection: 'column',
  minHeight: 0,
  overflowY: 'auto',
  margin: theme.space(none),
  padding: theme.space(none),
  listStyle: 'none',
}));

export const NotificationEntry = styled(PolymorphicStack)(({ theme }) => ({
  padding: theme.space(sm, md),

  [`& [${CONTENT_ATTRIBUTE}]`]: {
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: CONTENT_LINES,
    overflow: 'hidden',
  },

  '&:not(:last-of-type)': { borderBottom: `1px solid ${theme.palette.divider}` },
}));
