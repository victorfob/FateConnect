import TextField from '@mui/material/TextField';

import { styled } from '@src-ds/styled';

export const FieldRoot = styled(TextField)({
  // O raio do campo fica no tema, em `MuiOutlinedInput` — não aqui.
  // Quem abre o seletor de hora é o botão de adorno; o indicador nativo por
  // cima dele dava dois relógios no mesmo campo.
  '& input[type="time"]::-webkit-calendar-picker-indicator': { display: 'none' },
});
