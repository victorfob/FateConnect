import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';

import { styled } from '@ds-root/styled';

/**
 * Distância entre a borda do campo e o desenho do botão de adorno, menos a que
 * a seta do `select` já pratica. Medido a 412px: o botão soma o recuo do campo
 * ao recuo próprio e para a 24px, enquanto a seta desenha a 14px.
 */
const SELECT_ARROW_ALIGNMENT_PX = 10;

export const FieldRoot = styled(TextField)({
  // O raio do campo fica no tema, em `MuiOutlinedInput` — não aqui.
  // Quem abre o seletor de hora é o botão de adorno; o indicador nativo por
  // cima dele dava dois relógios no mesmo campo.
  '& input[type="time"]::-webkit-calendar-picker-indicator': { display: 'none' },
});

/** Puxa os botões do campo para a linha em que a seta do `select` desenha. */
export const EndAdornment = styled(InputAdornment)({
  marginRight: `-${SELECT_ARROW_ALIGNMENT_PX}px`,
});
