import type { IconButtonProps as MuiIconButtonProps } from '@mui/material/IconButton';

import { IconButton } from '@ds-root/components/IconButton';
import { DATE_PICKER_LABEL } from '@ds-root/components/Input/constants';

export type DatePickerButtonProps = Readonly<Omit<MuiIconButtonProps, 'aria-label' | 'title'>>;

/**
 * O `DatePicker` desenha o próprio botão de abrir, e o rótulo dele viria da
 * tradução do Material, sem tooltip. Este componente ocupa o slot para o botão
 * obedecer à mesma regra dos outros: rótulo nosso, visível ao ponteiro.
 */
export function DatePickerButton(buttonProps: DatePickerButtonProps) {
  return <IconButton {...buttonProps} label={DATE_PICKER_LABEL} />;
}
