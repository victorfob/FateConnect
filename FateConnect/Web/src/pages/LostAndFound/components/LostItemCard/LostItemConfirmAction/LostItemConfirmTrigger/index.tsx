import type { ReactNode } from 'react';
import { Button, IconButton } from '@design-system';

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
    <IconButton type="button" label={label} onClick={onClick}>
      {icon}
    </IconButton>
  );
}
