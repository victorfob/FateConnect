import { Link as RouterLink } from 'react-router';
import { Typography } from '@design-system';

import type { RoutePathEnum } from '@app/routes/paths';

import { BrandMark } from './BrandMark';
import { BrandMarkToneEnum } from './BrandMark/@types';
import * as C from './constants';
import * as S from './styles';

type BrandLogoProps = Readonly<{ to: RoutePathEnum; onClick?: VoidFunction }>;

export function BrandLogo({ to, onClick }: BrandLogoProps) {
  return (
    <S.LogoLink component={RouterLink} to={to} aria-label={C.LOGO_LABEL} onClick={onClick}>
      <BrandMark tone={BrandMarkToneEnum.CHROME} />
      <Typography variant="logo" color="inherit">
        {C.LOGO_FIRST_WORD}
        <S.AccentInitial component="span">{C.LOGO_ACCENT_INITIAL}</S.AccentInitial>
        {C.LOGO_SECOND_WORD}
      </Typography>
    </S.LogoLink>
  );
}
