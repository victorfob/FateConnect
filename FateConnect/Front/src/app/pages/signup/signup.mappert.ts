import { User } from "./models/user.model";

export function mapSignupFormToDto(formValue: any): User {
  return {
    nomeCompleto: formValue.fullName,
    apelido: formValue.nickname || undefined,
    emailFatec: formValue.fatecEmail,
    senha: formValue.password,
    dataNascimento: formValue.birthDate!.toISOString(),
    genero: Number(formValue.gender),
    enderecos: [
      {
        cep: formValue.zipCode.replace(/\D/g, ''),
        logradouro: formValue.street,
        numero: formValue.streetNumber,
        complemento: formValue.complement,
        cidade: formValue.city,
        estado: formValue.state,
      }
    ],
    contatos: [
      {
        telefone: formValue.phone.replace(/\D/g, ''),
        emailContato: formValue.contactEmail,
      }
    ]
  };
}
