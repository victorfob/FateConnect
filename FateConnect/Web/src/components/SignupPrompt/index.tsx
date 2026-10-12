import { Link as RouterLink } from 'react-router';
import { Typography } from '@design-system';

import { AuthCard } from '@app/components/AuthCard';
import { RoutePathEnum } from '@app/routes/paths';

import * as C from './constants';

export function SignupPrompt() {
  return (
    <AuthCard.Prompt component="p">
      <Typography variant="caption">{C.SIGNUP_PROMPT}</Typography>
      <RouterLink to={RoutePathEnum.SIGNUP}>
        <Typography variant="captionBold">{C.SIGNUP_LINK_LABEL}</Typography>
      </RouterLink>
    </AuthCard.Prompt>
  );
}
