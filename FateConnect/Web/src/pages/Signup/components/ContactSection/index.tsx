import { Input } from '@design-system';
import { useFormContext } from 'react-hook-form';

import { useMaskedField } from '@app/hooks/useMaskedField';
import { FIELD_LABELS, FIELD_PLACEHOLDERS } from '@app/pages/Signup/constants';
import type { SignupFormValues } from '@app/pages/Signup/schema';
import { maskPhone } from '@app/utils/masks/phoneMask';

import * as S from './styles';

/** Telefone e e-mail de contato. */
export function ContactSection() {
  const {
    register,
    formState: { errors },
  } = useFormContext<SignupFormValues>();
  const phoneField = useMaskedField(register('phone'), maskPhone);

  return (
    <>
      <S.HalfWidthCell>
        <Input
          {...phoneField}
          label={FIELD_LABELS.phone}
          required
          fullWidth
          type="tel"
          inputMode="tel"
          autoComplete="home tel"
          placeholder={FIELD_PLACEHOLDERS.phone}
          error={errors.phone?.message}
        />
      </S.HalfWidthCell>

      <S.HalfWidthCell>
        <Input
          {...register('contactEmail')}
          label={FIELD_LABELS.contactEmail}
          required
          fullWidth
          type="email"
          autoComplete="home email"
          error={errors.contactEmail?.message}
        />
      </S.HalfWidthCell>
    </>
  );
}
