import { useFormContext } from 'react-hook-form';

import { useMaskedField } from '@app/hooks/useMaskedField';
import { maskPhone } from '@app/utils/masks/phoneMask';
import { TextField } from '@design-system';

import { FIELD_LABELS, FIELD_PLACEHOLDERS } from '../../constants';
import type { SignupFormValues } from '../../schema';
import * as S from '../../styles';

/** Telefone e e-mail de contato. */
export function ContactSection() {
  const {
    register,
    formState: { errors },
  } = useFormContext<SignupFormValues>();
  const phoneField = useMaskedField(register('phone'), maskPhone);

  return (
    <S.FieldGrid>
      <S.HalfWidthCell>
        <TextField
          {...phoneField}
          label={FIELD_LABELS.phone}
          required
          fullWidth
          type="tel"
          inputMode="tel"
          autoComplete="home tel"
          placeholder={FIELD_PLACEHOLDERS.phone}
          error={Boolean(errors.phone)}
          helperText={errors.phone?.message}
        />
      </S.HalfWidthCell>

      <S.HalfWidthCell>
        <TextField
          {...register('contactEmail')}
          label={FIELD_LABELS.contactEmail}
          required
          fullWidth
          type="email"
          autoComplete="home email"
          error={Boolean(errors.contactEmail)}
          helperText={errors.contactEmail?.message}
        />
      </S.HalfWidthCell>
    </S.FieldGrid>
  );
}
