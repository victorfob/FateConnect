import { useFormContext } from 'react-hook-form';

import { CircularProgress, InputAdornment, TextField } from '@design-system';

import * as C from '../../constants';
import { useAddressAutofill } from '../../hooks/useAddressAutofill';
import { useFilledLabel } from '../../hooks/useFilledLabel';
import { SelectField } from '../SelectField';
import type { SignupFormValues } from '../../schema';
import * as S from '../../styles';
import { useMaskedField } from '@app/hooks/useMaskedField';
import { maskZipCode } from '@app/utils/masks/zipCodeMask';

const SPINNER_SIZE_PX = 20;

/** Endereço, preenchido pelo CEP quando ele está completo. */
export function AddressSection() {
  const { register } = useFormContext<SignupFormValues>();
  const { isLookingUpZipCode } = useAddressAutofill();
  const zipCodeField = useMaskedField(register('zipCode'), maskZipCode);
  const zipCodeLabel = useFilledLabel('zipCode');
  const streetLabel = useFilledLabel('street');
  const cityLabel = useFilledLabel('city');

  return (
    <S.FieldGrid>
      <S.ThirdWidthCell>
        <TextField
          {...zipCodeField}
          label={C.FIELD_LABELS.zipCode}
          fullWidth
          type="text"
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder={C.FIELD_PLACEHOLDERS.zipCode}
          aria-busy={isLookingUpZipCode}
          slotProps={{
            inputLabel: zipCodeLabel,
            input: {
              endAdornment: isLookingUpZipCode ? (
                <InputAdornment position="end">
                  <CircularProgress size={SPINNER_SIZE_PX} aria-label={C.ZIP_LOOKUP_LABEL} />
                </InputAdornment>
              ) : null,
            },
          }}
        />
      </S.ThirdWidthCell>

      <S.ThirdWidthCell>
        <SelectField
          name="state"
          label={C.FIELD_LABELS.state}
          options={C.BRAZILIAN_STATES}
          autoComplete="address-level1"
        />
      </S.ThirdWidthCell>

      <S.ThirdWidthCell>
        <TextField
          {...register('city')}
          label={C.FIELD_LABELS.city}
          fullWidth
          type="text"
          autoComplete="address-level2"
          slotProps={{ inputLabel: cityLabel }}
        />
      </S.ThirdWidthCell>

      <S.StreetCell>
        <TextField
          {...register('street')}
          label={C.FIELD_LABELS.street}
          fullWidth
          type="text"
          autoComplete="address-line1"
          slotProps={{ inputLabel: streetLabel }}
        />
      </S.StreetCell>

      <S.StreetNumberCell>
        <TextField
          {...register('streetNumber')}
          label={C.FIELD_LABELS.streetNumber}
          fullWidth
          type="text"
          autoComplete="off"
        />
      </S.StreetNumberCell>

      <S.FullWidthCell>
        <TextField
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
