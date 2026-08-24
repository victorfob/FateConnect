import IconButton from '@mui/material/IconButton';

import { ScheduleIcon } from '@src-ds/icons';
import { TIME_PICKER_LABEL } from '@src-ds/components/Input/constants';

export type TimePickerButtonProps = Readonly<{ onOpen: VoidFunction }>;

export function TimePickerButton({ onOpen }: TimePickerButtonProps) {
  return (
    <IconButton type="button" aria-label={TIME_PICKER_LABEL} onClick={onOpen}>
      <ScheduleIcon />
    </IconButton>
  );
}
