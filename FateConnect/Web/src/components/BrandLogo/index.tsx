import { Link as RouterLink } from 'react-router';
import { Typography } from '@design-system';

import type { RoutePathEnum } from '@app/routes/paths';

const LOGO_LABEL = 'FateConnect';

type BrandLogoProps = Readonly<{ to: RoutePathEnum; onClick?: VoidFunction }>;

export function BrandLogo({ to, onClick }: BrandLogoProps) {
  return (
    <RouterLink to={to} aria-label={LOGO_LABEL} onClick={onClick}>
      <Typography variant="logo" color="inherit">
        {LOGO_LABEL}
      </Typography>
    </RouterLink>
  );
}
