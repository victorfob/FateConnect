import {
  FormControlLabel,
  keyframes,
  spacingScale,
  Stack,
  styled,
  Typography,
} from '@design-system';

const { none, xxs, sm, md } = spacingScale;

const HINT_ENTRY_OFFSET_PX = 6;

/** A frase aparece por escolha de quem marca, então ela entra vindo de cima. */
const hintEntry = keyframes({
  from: { opacity: 0, transform: `translateY(-${HINT_ENTRY_OFFSET_PX}px)` },
  to: { opacity: 1, transform: 'translateY(0)' },
});

export const FieldsColumn = styled(Stack)(({ theme }) => ({
  flexDirection: 'column',
  gap: theme.space(md),
  // Respiro para o rótulo do campo preenchido não sair cortado na rolagem.
  paddingTop: theme.space(sm),
}));

export const ConfidentialGroup = styled(Stack)(({ theme }) => ({
  flexDirection: 'column',
  gap: theme.space(xxs),
}));

/** O rótulo ocupa a sobra e o interruptor fica no fim: o alvo é a linha inteira. */
export const ConfidentialToggle = styled(FormControlLabel)(({ theme }) => ({
  width: '100%',
  justifyContent: 'space-between',
  // O recuo que o tema dá ao rótulo alinharia o texto 4px à direita dos campos.
  '& .MuiFormControlLabel-label': { paddingLeft: theme.space(none) },
}));

export const ConfidentialHint = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  animation: `${hintEntry} ${theme.transitions.duration.enteringScreen}ms ${theme.transitions.easing.easeOut}`,

  '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
}));
