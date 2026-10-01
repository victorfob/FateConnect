/** O limite do e-mail para contato no `UpdateUserDto` e no `AdminUpdateUserDto`. */
export const MAX_CONTACT_EMAIL_LENGTH = 150;

export const CONTACT_FIELD_LABELS = {
  phone: 'Telefone',
  contactEmail: 'E-mail para contato',
};

export const PHONE_PLACEHOLDER = '(00) 00000-0000';

export const CONTACT_MESSAGES = {
  phoneRequired: 'Informe o telefone',
  phoneInvalid: 'Telefone com DDD: 10 ou 11 dígitos',
  contactEmailRequired: 'Informe o e-mail',
  contactEmailInvalid: 'E-mail inválido',
};
