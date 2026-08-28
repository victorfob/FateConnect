import { Checkbox, FormControlLabel } from '@design-system';
import { useFormContext } from 'react-hook-form';

import { PRIVACY_URL, TERMS_URL } from '@app/constants/legalDocuments';
import type { SignupFormValues } from '@app/pages/Signup/schema';

import * as C from './constants';
import * as S from './styles';

export function ConsentSection() {
  const {
    register,
    formState: { errors },
  } = useFormContext<SignupFormValues>();

  return (
    <S.ConsentGroup>
      {/*
        Os trechos de texto são `label` e os links ficam FORA deles, de propósito:
        assim clicar no texto marca a caixa por comportamento nativo, e clicar no
        link só navega. Link dentro de rótulo acionaria a caixa junto, e o único
        jeito de impedir isso — `preventDefault` — mataria a navegação.
      */}
      <S.TermsRow>
        <Checkbox
          id={C.CONSENT_TERMS_FIELD_ID}
          {...register('acceptTerms')}
          slotProps={{ input: { 'aria-label': C.CONSENT_TERMS_ARIA_LABEL } }}
        />

        <S.TermsText component="span">
          <S.TermsLabel component="label" htmlFor={C.CONSENT_TERMS_FIELD_ID}>
            {C.CONSENT_TERMS_PREFIX}{' '}
          </S.TermsLabel>

          <S.InlineLink component="a" href={TERMS_URL} target="_blank" rel="noreferrer">
            {C.CONSENT_TERMS_LINK}
          </S.InlineLink>

          <S.TermsLabel component="label" htmlFor={C.CONSENT_TERMS_FIELD_ID}>
            {' '}
            {C.CONSENT_TERMS_SEPARATOR}{' '}
          </S.TermsLabel>

          <S.InlineLink component="a" href={PRIVACY_URL} target="_blank" rel="noreferrer">
            {C.CONSENT_PRIVACY_LINK}
          </S.InlineLink>
        </S.TermsText>
      </S.TermsRow>

      {errors.acceptTerms && (
        <S.ConsentError component="span" role="alert">
          {errors.acceptTerms.message}
        </S.ConsentError>
      )}

      <FormControlLabel
        control={<Checkbox {...register('acceptMarketing')} />}
        label={C.CONSENT_MARKETING_LABEL}
      />
    </S.ConsentGroup>
  );
}
