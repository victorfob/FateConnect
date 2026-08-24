import IconButton from '@mui/material/IconButton';

import { TIME_PICKER_LABEL } from '@src-ds/components/Input/constants';
import { ScheduleIcon } from '@src-ds/icons';

export type TimePickerButtonProps = Readonly<{ onOpen: VoidFunction }>;

export function TimePickerButton({ onOpen }: TimePickerButtonProps) {
  return (
    <IconButton type="button" aria-label={TIME_PICKER_LABEL} onClick={onOpen}>
      <ScheduleIcon />
    </IconButton>
  );
}
