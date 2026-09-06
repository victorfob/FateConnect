import { useCallback } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router';
import { Button, Typography } from '@design-system';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { FormProvider, useForm } from 'react-hook-form';

import { useNotification } from '@app/hooks/useNotification';
import { LandingSectionEnum, RoutePathEnum } from '@app/routes/paths';
import { ApiError } from '@app/services/httpClient';
import { signup } from '@app/services/signup/signupService';

import { AccountSection } from './components/AccountSection';
import { AddressSection } from './components/AddressSection';
import { ConsentSection } from './components/ConsentSection';
import { ContactSection } from './components/ContactSection';
import { conflictFieldOf } from './helpers/conflictField';
import { toSignupRequest } from './helpers/mapper';
import { SIGNUP_DEFAULT_VALUES, signupSchema, type SignupFormValues } from './schema';
import * as C from './constants';
import * as S from './styles';

const TITLE_ID = 'signup-title';
const CONFLICT = 409;
const BAD_REQUEST = 400;
const LOGIN_ANCHOR = `${RoutePathEnum.LANDING}#${LandingSectionEnum.LOGIN}`;

function errorMessageFor(status?: number): string {
  if (status === CONFLICT) return C.SIGNUP_ERROR_MESSAGES.emailTaken;
  if (status === BAD_REQUEST) return C.SIGNUP_ERROR_MESSAGES.invalidData;

  return C.SIGNUP_ERROR_MESSAGES.generic;
}

export function Signup() {
  const navigate = useNavigate();
  const { notifySuccess, notifyError } = useNotification();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: signup,
    // A mensagem depende do status; o aviso sai daqui, não do tratamento global.
    meta: { notifiesErrorItself: true },
    onSuccess: () => {
      notifySuccess(C.SIGNUP_SUCCESS_MESSAGE);
      navigate(RoutePathEnum.MENU);
    },
  });

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: SIGNUP_DEFAULT_VALUES,
    disabled: isPending,
  });

  const reportFailure = useCallback(
    (error: unknown) => {
      if (!(error instanceof ApiError)) {
        notifyError(C.SIGNUP_ERROR_MESSAGES.generic);
        return;
      }

      const field = conflictFieldOf(error);

      if (field) {
        form.setError(field, { message: C.SIGNUP_CONFLICT_MESSAGES[field] }, { shouldFocus: true });
        return;
      }

      notifyError(errorMessageFor(error.status));
    },
    [form, notifyError],
  );

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      await mutateAsync(toSignupRequest(values));
    } catch (error) {
      reportFailure(error);
    }
  });

  return (
    <S.PageRoot>
      <S.SignupCard component="article" aria-labelledby={TITLE_ID}>
        <S.CardTitle variant="h2" id={TITLE_ID}>
          {C.SIGNUP_TITLE}
        </S.CardTitle>

        <FormProvider {...form}>
          <S.SignupForm component="form" onSubmit={handleSubmit} noValidate>
            <S.FieldGrid>
              <AccountSection />
            </S.FieldGrid>

            <S.SectionDivider />
            <S.SectionTitle variant="subtitleBold">{C.ADDRESS_SECTION_TITLE}</S.SectionTitle>
            <S.FieldGrid>
              <AddressSection />
            </S.FieldGrid>

            <S.SectionDivider />
            <S.SectionTitle variant="subtitleBold">{C.CONTACT_SECTION_TITLE}</S.SectionTitle>
            <S.FieldGrid>
              <ContactSection />
            </S.FieldGrid>

            <S.SectionDivider />
            <ConsentSection />

            <S.SubmitContainer>
              <Button type="submit" variant="contained" color="secondary" loading={isPending}>
                {C.SUBMIT_LABEL}
              </Button>

              <S.LoginRow component="p">
                <Typography variant="caption">{C.LOGIN_PROMPT}</Typography>
                <RouterLink to={LOGIN_ANCHOR}>
                  <Typography variant="captionBold">{C.LOGIN_LINK_LABEL}</Typography>
                </RouterLink>
              </S.LoginRow>
            </S.SubmitContainer>
          </S.SignupForm>
        </FormProvider>
      </S.SignupCard>
    </S.PageRoot>
  );
}
