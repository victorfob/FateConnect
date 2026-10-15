/** Valores canônicos alinhados à serialização do backend. */
export enum DocumentTypeEnum {
  TERMS_OF_USE = 'TermsOfUse',
  PRIVACY_POLICY = 'PrivacyPolicy',
}

export type DocumentAcceptance = {
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
  acceptances: DocumentAcceptance[];
  receiveNotifications: boolean;
};
