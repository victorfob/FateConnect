import { Input } from '@design-system';
import { useFormContext, useWatch } from 'react-hook-form';

import { useMaskedField } from '@app/hooks/useMaskedField';
import { maskPhone } from '@app/utils/masks/phoneMask';

import { CONTACT_FIELD_LABELS, MAX_CONTACT_EMAIL_LENGTH, PHONE_PLACEHOLDER } from './constants';

type ContactFormValues = { phone: string; contactEmail: string; contactIsRequired: boolean };

/** Telefone e e-mail para contato: obrigatórios para quem já os tem, opcionais para quem ainda não. */
export function ContactFields() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<ContactFormValues>();
  const contactIsRequired = useWatch({ control, name: 'contactIsRequired' });
  const phoneField = useMaskedField(register('phone'), maskPhone);

  return (
    <>
      <Input
        {...phoneField}
        label={CONTACT_FIELD_LABELS.phone}
        required={contactIsRequired}
        fullWidth
        type="tel"
        inputMode="tel"
        autoComplete="home tel"
        placeholder={PHONE_PLACEHOLDER}
        error={errors.phone?.message}
      />

      <Input
        {...register('contactEmail')}
        label={CONTACT_FIELD_LABELS.contactEmail}
        required={contactIsRequired}
        fullWidth
        type="email"
        autoComplete="home email"
        maxLength={MAX_CONTACT_EMAIL_LENGTH}
        error={errors.contactEmail?.message}
      />
    </>
  );
}
