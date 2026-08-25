import { CircularProgress, Input } from '@design-system';
import { Controller, useFormContext } from 'react-hook-form';

import { useMaskedField } from '@app/hooks/useMaskedField';
import { FIELD_LABELS, FIELD_PLACEHOLDERS } from '@app/pages/Signup/constants';
import { useAddressAutofill } from '@app/pages/Signup/hooks/useAddressAutofill';
import { useFilledLabel } from '@app/pages/Signup/hooks/useFilledLabel';
import type { SignupFormValues } from '@app/pages/Signup/schema';
import { maskZipCode } from '@app/utils/masks/zipCodeMask';

import { STATE_SELECT_OPTIONS, ZIP_LOOKUP_LABEL } from './constants';
import * as S from './styles';

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
    <>
      <S.ThirdWidthCell>
        <Input
          {...zipCodeField}
          label={FIELD_LABELS.zipCode}
          required
          error={errors.zipCode?.message}
          fullWidth
          type="text"
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder={FIELD_PLACEHOLDERS.zipCode}
          aria-busy={isLookingUpZipCode}
          shrinkLabel={isZipCodeFilled}
          endAdornment={
            isLookingUpZipCode ? (
              <CircularProgress size={SPINNER_SIZE_PX} aria-label={ZIP_LOOKUP_LABEL} />
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
              label={FIELD_LABELS.state}
              options={STATE_SELECT_OPTIONS}
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
          label={FIELD_LABELS.city}
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
          label={FIELD_LABELS.street}
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
          label={FIELD_LABELS.streetNumber}
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
          label={FIELD_LABELS.complement}
          fullWidth
          type="text"
          autoComplete="address-line2"
        />
      </S.FullWidthCell>
    </>
  );
}
