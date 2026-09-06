import {
  Box,
  radiusScale,
  shadowTokens,
  spacingScale,
  Stack,
  styled,
  Switch,
  Typography,
} from '@design-system';

const { none, xxs, xs, sm, md, lg } = spacingScale;

export const SettingsCard = styled(Stack)(({ theme }) => ({
  flexDirection: 'column',
  gap: theme.space(md),
  padding: theme.space(lg),
  borderRadius: theme.radius(radiusScale.component),
  backgroundColor: theme.palette.background.paper,
  boxShadow: shadowTokens.component,
  color: theme.palette.text.primary,
}));

export const SectionHeading = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.space(xs),
}));

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

/**
 * Interruptor no desenho do iOS: trilho sólido do tamanho do polegar, sem o véu
 * translúcido do Material — era ele que deixava o estado desligado em 2,68:1,
 * abaixo do mínimo de 3:1 para não-texto.
 */
export const ThemeSwitch = styled(Switch)(({ theme }) => ({
  width: '48px',
  height: '30px',
  padding: theme.space(none),
  '& .MuiSwitch-switchBase': {
    padding: theme.space(xxs),
    '&.Mui-checked': {
      transform: 'translateX(18px)',
      '& + .MuiSwitch-track': {
        backgroundColor: theme.palette.secondary.main,
        opacity: 1,
      },
    },
  },
  '& .MuiSwitch-track': {
    borderRadius: '15px',
    backgroundColor: theme.palette.switchTrack,
    opacity: 1,
    transition: theme.transitions.create('background-color'),
  },
}));
