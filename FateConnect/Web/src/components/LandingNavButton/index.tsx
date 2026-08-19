import { useCallback } from 'react';

import type { LandingSectionEnum } from '@app/routes/paths';
import { Button } from '@design-system';

type LandingNavButtonProps = Readonly<{
  section: LandingSectionEnum;
  label: string;
  highlighted: boolean;
  onSelect: (section: LandingSectionEnum) => void;
}>;

/** Botão de seção da landing. Existe para não criar callback anônimo no JSX do header. */
export function LandingNavButton({ section, label, highlighted, onSelect }: LandingNavButtonProps) {
  const handleClick = useCallback(() => onSelect(section), [onSelect, section]);

  if (highlighted)
    return (
      <Button type="button" variant="contained" color="secondary" onClick={handleClick}>
        {label}
      </Button>
    );

  return (
    <Button type="button" color="inherit" onClick={handleClick}>
      {label}
    </Button>
  );
}
