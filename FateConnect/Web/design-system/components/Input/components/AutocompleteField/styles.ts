import { inputBaseClasses } from '@mui/material/InputBase';
import { outlinedInputClasses } from '@mui/material/OutlinedInput';
import TextField from '@mui/material/TextField';

import { styled } from '@ds-root/styled';

/** O recuo do fim do campo com adorno, que o `Autocomplete` troca pelo dele. */
const ADORNED_END_INSET_PX = 14;

export const FieldRoot = styled(TextField)({
  [`& .${outlinedInputClasses.root}.${inputBaseClasses.adornedEnd}`]: {
    paddingRight: `${ADORNED_END_INSET_PX}px`,
  },
});
