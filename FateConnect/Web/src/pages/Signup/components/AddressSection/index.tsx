import { Controller, useFormContext } from 'react-hook-form';

import { useMaskedField } from '@app/hooks/useMaskedField';
import * as C from '@app/pages/Signup/constants';
import { useAddressAutofill } from '@app/pages/Signup/hooks/useAddressAutofill';
import { useFilledLabel } from '@app/pages/Signup/hooks/useFilledLabel';
import type { SignupFormValues } from '@app/pages/Signup/schema';
import * as S from '@app/pages/Signup/styles';
import { maskZipCode } from '@app/utils/masks/zipCodeMask';
import { CircularProgress, Input } from '@design-system';

const SPINNER_SIZE_PX = 20;

/** Endereço, preenchido pelo CEP quando ele está completo. */
export function AddressSection() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<SignupFormValues>();
  const { isLookingUpZipCode } = useAddressAutofill();
  const zipCodeField = useMaskedField(register('zipCode'), maskZipCode);
  const isZipCodeFilled = useFilledLabel('zipCode');
  const isStreetFilled = useFilledLabel('street');
  const isCityFilled = useFilledLabel('city');

  return (
    <S.FieldGrid>
      <S.ThirdWidthCell>
        <Input
          {...zipCodeField}
          label={C.FIELD_LABELS.zipCode}
          required
          error={errors.zipCode?.message}
          fullWidth
          type="text"
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder={C.FIELD_PLACEHOLDERS.zipCode}
          aria-busy={isLookingUpZipCode}
          shrinkLabel={isZipCodeFilled}
          endAdornment={
            isLookingUpZipCode ? (
              <CircularProgress size={SPINNER_SIZE_PX} aria-label={C.ZIP_LOOKUP_LABEL} />
            ) : null
          }
        />
      </S.ThirdWidthCell>

      <S.ThirdWidthCell>
        <Controller
          name="state"
          control={control}
          render={({ field }) => (
            <Input.Select
              {...field}
              label={C.FIELD_LABELS.state}
              options={C.STATE_SELECT_OPTIONS}
              autoComplete="address-level1"
              required
              error={errors.state?.message}
            />
          )}
        />
      </S.ThirdWidthCell>

      <S.ThirdWidthCell>
        <Input
          {...register('city')}
          label={C.FIELD_LABELS.city}
          required
          error={errors.city?.message}
          fullWidth
          type="text"
          autoComplete="address-level2"
          shrinkLabel={isCityFilled}
        />
      </S.ThirdWidthCell>

      <S.StreetCell>
        <Input
          {...register('street')}
          label={C.FIELD_LABELS.street}
          required
          error={errors.street?.message}
          fullWidth
          type="text"
          autoComplete="address-line1"
          shrinkLabel={isStreetFilled}
        />
      </S.StreetCell>

      <S.StreetNumberCell>
        <Input
          {...register('streetNumber')}
          label={C.FIELD_LABELS.streetNumber}
          required
          error={errors.streetNumber?.message}
          fullWidth
          type="text"
          autoComplete="off"
        />
      </S.StreetNumberCell>

      <S.FullWidthCell>
        <Input
          {...register('complement')}
          label={C.FIELD_LABELS.complement}
          fullWidth
          type="text"
          autoComplete="address-line2"
        />
      </S.FullWidthCell>
    </S.FieldGrid>
  );
}
