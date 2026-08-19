import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { FormProvider, useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router';

import { useNotification } from '@app/hooks/useNotification';
import { LandingSectionEnum, RoutePathEnum } from '@app/routes/paths';
import type { ApiError } from '@app/services/httpClient';
import { signup } from '@app/services/signup/signupService';
import { Button, Typography } from '@design-system';

import { AccountSection } from './components/AccountSection';
import { AddressSection } from './components/AddressSection';
import { ConsentSection } from './components/ConsentSection';
import { ContactSection } from './components/ContactSection';
import {
  ADDRESS_SECTION_TITLE,
  CONTACT_SECTION_TITLE,
  LOGIN_LINK_LABEL,
  LOGIN_PROMPT,
  SIGNUP_ERROR_MESSAGES,
  SIGNUP_TITLE,
  SUBMIT_LABEL,
  signupSuccessMessage,
} from './constants';
import { toSignupRequest } from './helpers/mapper';
import { SIGNUP_DEFAULT_VALUES, signupSchema, type SignupFormValues } from './schema';
import * as S from './styles';

const TITLE_ID = 'signup-title';
const CONFLICT = 409;
const BAD_REQUEST = 400;
const LOGIN_ANCHOR = `${RoutePathEnum.LANDING}#${LandingSectionEnum.LOGIN}`;

function errorMessageFor(status?: number): string {
  if (status === CONFLICT) return SIGNUP_ERROR_MESSAGES.emailTaken;
  if (status === BAD_REQUEST) return SIGNUP_ERROR_MESSAGES.invalidData;

  return SIGNUP_ERROR_MESSAGES.generic;
}

export function Signup() {
  const navigate = useNavigate();
  const { notifySuccess, notifyError } = useNotification();

  const { mutate, isPending } = useMutation({
    mutationFn: signup,
    // A mensagem depende do status; o aviso sai daqui, não do tratamento global.
    meta: { notifiesErrorItself: true },
    onSuccess: (response) => {
      notifySuccess(signupSuccessMessage(response.nomeCompleto));
      navigate(LOGIN_ANCHOR);
    },
    onError: (error: ApiError) => notifyError(errorMessageFor(error.status)),
  });

  // O formulário inteiro fica desabilitado durante o envio e volta em caso de erro.
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: SIGNUP_DEFAULT_VALUES,
    disabled: isPending,
  });

  const handleSubmit = form.handleSubmit((values) => mutate(toSignupRequest(values)));

  return (
    <S.PageRoot>
      <S.SignupCard component="article" aria-labelledby={TITLE_ID}>
        <S.CardTitle variant="h2" id={TITLE_ID}>
          {SIGNUP_TITLE}
        </S.CardTitle>

        <FormProvider {...form}>
          <S.SignupForm component="form" onSubmit={handleSubmit} noValidate>
            <AccountSection />

            <S.SectionDivider />
            <S.SectionTitle variant="subtitleBold">{ADDRESS_SECTION_TITLE}</S.SectionTitle>
            <AddressSection />

            <S.SectionDivider />
            <S.SectionTitle variant="subtitleBold">{CONTACT_SECTION_TITLE}</S.SectionTitle>
            <ContactSection />

            <S.SectionDivider />
            <ConsentSection />

            <S.SubmitContainer>
              <Button type="submit" variant="contained" color="error" loading={isPending}>
                {SUBMIT_LABEL}
              </Button>

              <S.LoginRow component="p">
                <Typography variant="caption">{LOGIN_PROMPT}</Typography>
                <RouterLink to={LOGIN_ANCHOR}>
                  <Typography variant="captionBold">{LOGIN_LINK_LABEL}</Typography>
                </RouterLink>
              </S.LoginRow>
            </S.SubmitContainer>
          </S.SignupForm>
        </FormProvider>
      </S.SignupCard>
    </S.PageRoot>
  );
}
