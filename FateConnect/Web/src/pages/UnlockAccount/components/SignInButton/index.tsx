import { Link as RouterLink } from 'react-router';
import { Button } from '@design-system';

import { LandingSectionEnum, RoutePathEnum } from '@app/routes/paths';
import { loginPrefillState } from '@app/utils/loginPrefill';

import { SIGN_IN_LABEL } from '../../constants';

type SignInButtonProps = Readonly<{ email: string }>;

export function SignInButton({ email }: SignInButtonProps) {
  return (
    <Button
      component={RouterLink}
      to={{ pathname: RoutePathEnum.LANDING, hash: `#${LandingSectionEnum.LOGIN}` }}
      state={loginPrefillState(email)}
      variant="contained"
      color="secondary"
    >
      {SIGN_IN_LABEL}
    </Button>
  );
}
