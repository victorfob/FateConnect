import { useCallback } from 'react';
import type { MouseEvent } from 'react';
import { useFormContext } from 'react-hook-form';

import { useNotification } from '@app/hooks/useNotification';
import { Checkbox, FormControlLabel } from '@design-system';

import {
  CONSENT_MARKETING_LABEL,
  CONSENT_PRIVACY_LINK,
  CONSENT_TERMS_LINK,
  CONSENT_TERMS_PREFIX,
  CONSENT_TERMS_SEPARATOR,
  LEGAL_SOON_MESSAGES,
} from '../../constants';
import type { SignupFormValues } from '../../schema';
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
      notifyWarning(LEGAL_SOON_MESSAGES.terms);
    },
    [notifyWarning],
  );

  const handlePrivacyClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();
      notifyWarning(LEGAL_SOON_MESSAGES.privacy);
    },
    [notifyWarning],
  );

  return (
    <S.ConsentGroup>
      <FormControlLabel
        control={<Checkbox {...register('acceptTerms')} />}
        label={
          <span>
            {CONSENT_TERMS_PREFIX}{' '}
            <S.InlineLink component="button" type="button" onClick={handleTermsClick}>
              {CONSENT_TERMS_LINK}
            </S.InlineLink>{' '}
            {CONSENT_TERMS_SEPARATOR}{' '}
            <S.InlineLink component="button" type="button" onClick={handlePrivacyClick}>
              {CONSENT_PRIVACY_LINK}
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
        label={CONSENT_MARKETING_LABEL}
      />
    </S.ConsentGroup>
  );
}
