import type { SignupRequest } from '@app/services/signup/types';
import { onlyDigits } from '@app/utils/masks/caret';

import type { SignupFormValues } from '../schema';
import { parseBirthDate, toApiBirthDate } from './birthDate';

/** Campo opcional: o backend prefere a ausência da chave a uma string vazia. */
function optionalText(value: string): string | undefined {
  if (value.length === 0) return undefined;

  return value;
}

/** O schema já garantiu a data; o vazio só existe para o tipo fechar. */
function toApiBirthDateOrEmpty(value: string): string {
  const parsed = parseBirthDate(value);
  if (!parsed) return '';

  return toApiBirthDate(parsed);
}

/** Traduz o formulário para o contrato do backend, que fala pt-BR. */
export function toSignupRequest(values: SignupFormValues): SignupRequest {
  return {
    nomeCompleto: values.fullName,
    apelido: optionalText(values.nickname),
    emailFatec: values.fatecEmail,
    senha: values.password,
    dataNascimento: toApiBirthDateOrEmpty(values.birthDate),
    genero: values.gender,
    enderecos: [
      {
        cep: values.zipCode,
        logradouro: values.street,
        numero: values.streetNumber,
        complemento: values.complement,
        cidade: values.city,
        estado: values.state,
      },
    ],
    contatos: [
      {
        telefone: onlyDigits(values.phone),
        emailContato: values.contactEmail,
      },
    ],
  };
}
