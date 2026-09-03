/** Gênero com o nome que o enum do back usa — é esse texto que vai no payload. */
export enum GenderValueEnum {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other',
}

/** Campo que a API nomeia no conflito de cadastro — o texto é o do contrato. */
export enum SignupConflictFieldEnum {
  FATEC_EMAIL = 'fatecEmail',
  PHONE = 'phone',
  CONTACT_EMAIL = 'contactEmail',
}
