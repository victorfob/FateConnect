import { IconButton } from '@ds-root/components/IconButton';
import { TIME_PICKER_LABEL } from '@ds-root/components/Input/constants';
import { ScheduleIcon } from '@ds-root/icons';

export type TimePickerButtonProps = Readonly<{ onOpen: VoidFunction }>;

export function TimePickerButton({ onOpen }: TimePickerButtonProps) {
  return (
    <IconButton type="button" label={TIME_PICKER_LABEL} onClick={onOpen}>
      <ScheduleIcon />
    </IconButton>
  );
}
