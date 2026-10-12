import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import DangerousOutlinedIcon from '@mui/icons-material/DangerousOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import type SvgIcon from '@mui/material/SvgIcon';

import type { FeedbackTone } from '@ds-root/theme/types';

export const TONE_ICONS: Record<FeedbackTone, typeof SvgIcon> = {
  info: InfoOutlinedIcon,
  success: CheckCircleOutlinedIcon,
  warning: WarningAmberOutlinedIcon,
  error: DangerousOutlinedIcon,
};
