import { Box, shadowTokens, spacingScale, Stack, styled, Typography } from '@design-system';

const { xxs, sm } = spacingScale;

export const SettingRow = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.space(sm),
}));

export const SettingText = styled(Stack)(({ theme }) => ({
  flexDirection: 'column',
  gap: theme.space(xxs),
}));

export const SettingDescription = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

/**
 * O desenho substitui o botão inteiro do interruptor, então ele carrega o
 * círculo além do glifo. O glifo lê `chrome.main` porque o círculo é branco nos
 * dois temas: `text.secondary` clareia no escuro e sumiria dentro dele.
 */
export const SwitchThumb = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '22px',
  height: '22px',
  borderRadius: '50%',
  backgroundColor: theme.palette.common.white,
  boxShadow: shadowTokens.component,
  '& svg': { fontSize: '14px', color: theme.palette.chrome.main },
}));
