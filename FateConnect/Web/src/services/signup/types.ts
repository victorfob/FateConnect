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
};
