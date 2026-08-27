import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useFormContext, useWatch } from 'react-hook-form';

import { useDebouncedValue } from '@app/hooks/useDebouncedValue';
import { useNotification } from '@app/hooks/useNotification';
import { isCepNotFound, lookupCep } from '@app/services/cep/cepService';
import { onlyDigits } from '@app/utils/masks/caret';

import { ZIP_LOOKUP_MESSAGES } from '../constants';
import type { SignupFormValues } from '../schema';

const ZIP_CODE_DIGITS = 8;
const ZIP_LOOKUP_DEBOUNCE_MS = 400;

/**
 * Preenche o endereço a partir do CEP. A consulta só parte com o CEP completo e
 * depois de o usuário parar de digitar; trocar de CEP no meio cancela a consulta
 * anterior, que é o que o `queryKey` por dígitos garante.
 */
export function useAddressAutofill(): { isLookingUpZipCode: boolean } {
  const { control, setValue } = useFormContext<SignupFormValues>();
  const { notifyWarning, notifyError } = useNotification();

  const zipCode = useWatch({ control, name: 'zipCode' });
  const zipDigits = useDebouncedValue(onlyDigits(zipCode), ZIP_LOOKUP_DEBOUNCE_MS);

  const { data, isFetching, isError } = useQuery({
    queryKey: ['cep', zipDigits],
    queryFn: ({ signal }) => lookupCep(zipDigits, signal),
    enabled: zipDigits.length === ZIP_CODE_DIGITS,
    retry: false,
  });

  useEffect(() => {
    if (!data) return;

    if (isCepNotFound(data)) {
      setValue('street', '');
      setValue('city', '');
      setValue('state', '');
      notifyWarning(ZIP_LOOKUP_MESSAGES.notFound);

      return;
    }

    setValue('zipCode', data.cep ?? '');
    setValue('street', data.logradouro ?? '');
    setValue('city', data.localidade ?? '');
    setValue('state', data.uf ?? '');
  }, [data, setValue, notifyWarning]);

  useEffect(() => {
    if (!isError) return;

    notifyError(ZIP_LOOKUP_MESSAGES.failed);
  }, [isError, notifyError]);

  return { isLookingUpZipCode: isFetching };
}
