import type { ReactNode } from 'react';
import { FormGrid, Input } from '@design-system';
import { useFormContext, useWatch } from 'react-hook-form';

import { useMaskedField } from '@app/hooks/useMaskedField';
import { maskPhone } from '@app/utils/masks/phoneMask';

import { PhoneCell } from './components/PhoneCell';
import { CONTACT_FIELD_LABELS, MAX_CONTACT_EMAIL_LENGTH, PHONE_PLACEHOLDER } from './constants';
import { autoCompleteFor } from './helpers';

type ContactFormValues = { phone: string; contactEmail: string; contactIsRequired: boolean };

export type ContactFieldsProps = Readonly<{
  /** Divide a linha com o telefone; sem ele, o telefone ocupa a linha inteira. */
  phoneCompanion?: ReactNode;
  /** Desligado quando o formulário edita a conta de outra pessoa. */
  autoFill?: boolean;
}>;

/** Telefone e e-mail para contato: obrigatórios para quem já os tem, opcionais para quem ainda não. */
export function ContactFields({ phoneCompanion, autoFill = true }: ContactFieldsProps) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<ContactFormValues>();
  const contactIsRequired = useWatch({ control, name: 'contactIsRequired' });
  const phoneField = useMaskedField(register('phone'), maskPhone);

  return (
    <>
      <FormGrid.Wide>
        <Input
          {...register('contactEmail')}
          label={CONTACT_FIELD_LABELS.contactEmail}
          required={contactIsRequired}
          fullWidth
          type="email"
          autoComplete={autoCompleteFor(autoFill, 'home email')}
          maxLength={MAX_CONTACT_EMAIL_LENGTH}
          error={errors.contactEmail?.message}
        />
      </FormGrid.Wide>

      <PhoneCell alone={!phoneCompanion}>
        <Input
          {...phoneField}
          label={CONTACT_FIELD_LABELS.phone}
          required={contactIsRequired}
          fullWidth
          type="tel"
          inputMode="tel"
          autoComplete={autoCompleteFor(autoFill, 'home tel')}
          placeholder={PHONE_PLACEHOLDER}
          error={errors.phone?.message}
        />
      </PhoneCell>

      {phoneCompanion}
    </>
  );
}
