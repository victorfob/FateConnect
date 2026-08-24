import { useCallback } from 'react';
import type { MouseEvent } from 'react';
import { useFormContext } from 'react-hook-form';

import { useNotification } from '@app/hooks/useNotification';
import * as C from '@app/pages/Signup/constants';
import type { SignupFormValues } from '@app/pages/Signup/schema';
import { Checkbox, FormControlLabel } from '@design-system';

import * as S from './styles';

/** Aceites. Os documentos legais ainda não existem — o clique avisa isso. */
export function ConsentSection() {
  const {
    register,
    formState: { errors },
  } = useFormContext<SignupFormValues>();
  const { notifyWarning } = useNotification();

  // O clique não pode chegar ao rótulo, senão alterna a própria caixa de seleção.
  const handleTermsClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();
      notifyWarning(C.LEGAL_SOON_MESSAGES.terms);
    },
    [notifyWarning],
  );

  const handlePrivacyClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();
      notifyWarning(C.LEGAL_SOON_MESSAGES.privacy);
    },
    [notifyWarning],
  );

  return (
    <S.ConsentGroup>
      <FormControlLabel
        control={<Checkbox {...register('acceptTerms')} />}
        label={
          <span>
            {C.CONSENT_TERMS_PREFIX}{' '}
            <S.InlineLink component="button" type="button" onClick={handleTermsClick}>
              {C.CONSENT_TERMS_LINK}
            </S.InlineLink>{' '}
            {C.CONSENT_TERMS_SEPARATOR}{' '}
            <S.InlineLink component="button" type="button" onClick={handlePrivacyClick}>
              {C.CONSENT_PRIVACY_LINK}
            </S.InlineLink>
          </span>
        }
      />

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
