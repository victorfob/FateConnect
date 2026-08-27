import Tooltip from '@mui/material/Tooltip';

import { InfoIcon } from '@ds-root/icons';

import * as S from './styles';

export type InputHelpLabelProps = Readonly<{ children: string; helpText: string }>;

export function InputHelpLabel({ children, helpText }: InputHelpLabelProps) {
  return (
    <S.HelpLabelRow component="span">
      {children}
      <Tooltip title={helpText}>
        <InfoIcon fontSize="small" />
      </Tooltip>
    </S.HelpLabelRow>
  );
}
