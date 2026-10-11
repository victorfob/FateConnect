import { Link as RouterLink } from 'react-router';
import { Button, type ButtonProps } from '@design-system';

import { LandingSectionEnum, RoutePathEnum } from '@app/routes/paths';
import { loginPrefillState } from '@app/utils/loginPrefill';

import * as C from './constants';

type SignInButtonProps = Readonly<{ email: string } & Pick<ButtonProps, 'variant'>>;

export function SignInButton({ email, variant = 'contained' }: SignInButtonProps) {
  return (
    <Button
      component={RouterLink}
      to={{ pathname: RoutePathEnum.LANDING, hash: `#${LandingSectionEnum.LOGIN}` }}
      state={loginPrefillState(email)}
      variant={variant}
      color="secondary"
    >
      {C.SIGN_IN_LABEL}
    </Button>
  );
}
