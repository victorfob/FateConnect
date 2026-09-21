/** Valores canônicos alinhados à serialização do backend. */
export enum DocumentTypeEnum {
  TERMS_OF_USE = 'TermsOfUse',
  PRIVACY_POLICY = 'PrivacyPolicy',
}

export type SignupAcceptance = {
  document: DocumentTypeEnum;
  /** A data do documento que a pessoa leu, não a de hoje. */
  version: string;
};

export type SignupContact = {
  phone: string;
  contactEmail: string;
};

export type SignupRequest = {
  fatecEmail: string;
  password: string;
  fullName: string;
  birthDate: string;
  gender: string;
  contacts: SignupContact[];
  acceptances: SignupAcceptance[];
  receiveEmails: boolean;
  receiveNotifications: boolean;
};
