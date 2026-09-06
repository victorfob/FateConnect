import { useCallback, useState } from 'react';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import { HELP_TRIGGER_LABEL_PREFIX } from '@ds-root/components/Input/constants';
import { InfoIcon } from '@ds-root/icons';

export type InputHelpButtonProps = Readonly<{ fieldLabel: string; helpText: string }>;

/**
 * Adorno do campo, nunca parte do rótulo: dentro do `label` o toque vai parar no
 * campo, e o alvo encolhe junto com o texto do rótulo.
 */
export function InputHelpButton({ fieldLabel, helpText }: InputHelpButtonProps) {
  const [open, setOpen] = useState(false);

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <Tooltip
        title={helpText}
        // A explicação descreve o campo; quem nomeia o botão é o rótulo dele.
        describeChild
        // Quem atende o toque é o clique. O ouvinte de toque do MUI abre por
        // pressão longa e fecha 1,5s depois — tempo que não dá para ler.
        disableTouchListener
        open={open}
        onOpen={handleOpen}
        onClose={handleClose}
      >
        <IconButton
          type="button"
          size="small"
          aria-label={`${HELP_TRIGGER_LABEL_PREFIX} ${fieldLabel}`}
          onClick={handleOpen}
        >
          <InfoIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </ClickAwayListener>
  );
}
