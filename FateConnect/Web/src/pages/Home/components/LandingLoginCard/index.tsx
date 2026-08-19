import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router';

import { useNotification } from '@app/hooks/useNotification';
import { LandingSection, RoutePath } from '@app/routes/paths';
import { login } from '@app/services/auth/authService';
import type { ApiError } from '@app/services/httpClient';
import {
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  VisibilityIcon,
  VisibilityOffIcon,
} from '@design-system';

import {
  EMAIL_LABEL,
  LOGIN_CARD_TITLE,
  LOGIN_ERROR_MESSAGES,
  PASSWORD_LABEL,
  PASSWORD_TOGGLE_LABEL,
  SIGNUP_LINK_LABEL,
  SIGNUP_PROMPT,
  SUBMIT_LABEL,
  SUBMIT_LOADING_LABEL,
  welcomeMessage,
} from './constants';
import { loginSchema, type LoginFormValues } from './schema';
import * as S from './styles';

const UNAUTHORIZED = 401;

export function LandingLoginCard() {
  const navigate = useNavigate();
  const { hash } = useLocation();
  const { notifySuccess, notifyError } = useNotification();
  const emailInputRef = useRef<HTMLInputElement>(null);
  const [passwordHidden, setPasswordHidden] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // Chegando na landing pela âncora de login, o campo de e-mail recebe o foco.
  useEffect(() => {
    if (hash !== `#${LandingSection.LOGIN}`) return;

    emailInputRef.current?.focus();
  }, [hash]);

  const { mutate, isPending } = useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      notifySuccess(welcomeMessage(response.nomeCompleto));
      navigate(RoutePath.MENU);
    },
    onError: (error: ApiError) => {
      if (error.status === UNAUTHORIZED) {
        notifyError(LOGIN_ERROR_MESSAGES.invalidCredentials);
        return;
      }

      notifyError(LOGIN_ERROR_MESSAGES.generic);
    },
  });

  const handleTogglePassword = useCallback(() => setPasswordHidden((hidden) => !hidden), []);

  const onSubmit = handleSubmit(({ email, password }) => {
    mutate({ emailFatec: email, senha: password });
  });

  const { ref: emailFieldRef, ...emailField } = register('email');

  return (
    <S.CardRoot component="article" aria-labelledby="landing-login-title">
      <S.CardTitle>
        <Typography variant="h2" id="landing-login-title">
          {LOGIN_CARD_TITLE}
        </Typography>
      </S.CardTitle>

      <S.Form component="form" onSubmit={onSubmit} noValidate>
        <TextField
          {...emailField}
          inputRef={(element: HTMLInputElement | null) => {
            emailFieldRef(element);
            emailInputRef.current = element;
          }}
          label={EMAIL_LABEL}
          required
          type="email"
          autoComplete="username"
          error={Boolean(errors.email)}
          helperText={errors.email?.message}
        />

        <TextField
          {...register('password')}
          label={PASSWORD_LABEL}
          required
          type={passwordHidden ? 'password' : 'text'}
          autoComplete={passwordHidden ? 'current-password' : 'off'}
          error={Boolean(errors.password)}
          helperText={errors.password?.message}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    type="button"
                    aria-label={PASSWORD_TOGGLE_LABEL}
                    aria-pressed={!passwordHidden}
                    onClick={handleTogglePassword}
                  >
                    {/* O ícone mostra o estado atual: olho aberto = senha visível. */}
                    {passwordHidden ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        <S.SubmitRow>
          <Button type="submit" variant="contained" color="error" disabled={isPending}>
            {isPending ? SUBMIT_LOADING_LABEL : SUBMIT_LABEL}
          </Button>
        </S.SubmitRow>
      </S.Form>

      <S.SignupRow component="p">
        <Typography variant="caption">{SIGNUP_PROMPT}</Typography>
        <RouterLink to={RoutePath.SIGNUP}>
          <Typography variant="captionBold">{SIGNUP_LINK_LABEL}</Typography>
        </RouterLink>
      </S.SignupRow>
    </S.CardRoot>
  );
}
