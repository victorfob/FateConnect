import type { ReactNode } from 'react';

import { Button, IconButton } from '@design-system';

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
    <IconButton type="button" aria-label={label} onClick={onClick}>
      {icon}
    </IconButton>
  );
}
