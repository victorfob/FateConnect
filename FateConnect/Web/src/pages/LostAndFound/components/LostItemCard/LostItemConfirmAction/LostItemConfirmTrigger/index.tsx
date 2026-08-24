import type { ReactNode } from 'react';

import { Button, IconButton, Tooltip } from '@design-system';

type LostItemConfirmTriggerProps = Readonly<{
  label: string;
  icon?: ReactNode;
  onClick: VoidFunction;
}>;

export function LostItemConfirmTrigger({ label, icon, onClick }: LostItemConfirmTriggerProps) {
  if (!icon) {
    return (
      <Button type="button" variant="outlined" color="inherit" onClick={onClick}>
        {label}
      </Button>
    );
  }

  return (
    <Tooltip title={label}>
      <IconButton type="button" aria-label={label} onClick={onClick}>
        {icon}
      </IconButton>
    </Tooltip>
  );
}
