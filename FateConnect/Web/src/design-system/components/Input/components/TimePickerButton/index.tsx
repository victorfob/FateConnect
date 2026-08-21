import IconButton from '@mui/material/IconButton';

import { ScheduleIcon } from '../../../../icons';
import { TIME_PICKER_LABEL } from '../../constants';

export type TimePickerButtonProps = Readonly<{ onOpen: VoidFunction }>;

export function TimePickerButton({ onOpen }: TimePickerButtonProps) {
  return (
    <IconButton type="button" aria-label={TIME_PICKER_LABEL} onClick={onOpen}>
      <ScheduleIcon />
    </IconButton>
  );
}
