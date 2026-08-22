import Tooltip from '@mui/material/Tooltip';

import { InfoIcon } from '@src-ds/icons';
import * as S from './styles';

export type InputHelpLabelProps = Readonly<{ children: string; helpText: string }>;

/** Rótulo com dica ao lado, para o campo que precisa explicar as próprias opções. */
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
