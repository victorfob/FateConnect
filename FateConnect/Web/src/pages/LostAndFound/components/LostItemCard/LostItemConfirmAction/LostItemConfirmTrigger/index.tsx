import type { ReactNode } from 'react';

import { Button, IconButton, Tooltip } from '@design-system';

type LostItemConfirmTriggerProps = Readonly<{
  label: string;
  icon: ReactNode;
  iconOnly?: boolean;
  onClick: VoidFunction;
}>;

export function LostItemConfirmTrigger({
  label,
  icon,
  iconOnly,
  onClick,
}: LostItemConfirmTriggerProps) {
  if (!iconOnly) {
    return (
      <Button type="button" variant="soft" onClick={onClick}>
        {icon}
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
