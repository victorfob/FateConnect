import type { SignupRequest } from '@app/services/signup/types';
import { onlyDigits } from '@app/utils/masks/caret';
import { parseBirthDate } from './birthDate';
import type { SignupFormValues } from '../schema';

/** Campo opcional: o backend prefere a ausência da chave a uma string vazia. */
function optionalText(value: string): string | undefined {
  if (value.length === 0) return undefined;

  return value;
}

/** Traduz o formulário para o contrato do backend, que fala pt-BR. */
export function toSignupRequest(values: SignupFormValues): SignupRequest {
  return {
    nomeCompleto: values.fullName,
    apelido: optionalText(values.nickname),
    emailFatec: values.fatecEmail,
    senha: values.password,
    dataNascimento: parseBirthDate(values.birthDate)?.toISOString() ?? '',
    genero: Number(values.gender),
    enderecos: [
      {
        cep: onlyDigits(values.zipCode),
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
