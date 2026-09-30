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

export type SignupRequest = {
  fatecEmail: string;
  password: string;
  fullName: string;
  birthDate: string;
  gender: string;
  phone: string;
  contactEmail: string;
  acceptances: SignupAcceptance[];
  receiveEmails: boolean;
  receiveNotifications: boolean;
};
