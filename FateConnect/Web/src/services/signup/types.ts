export type SignupAddress = {
  zipCode: string;
  street: string;
  streetNumber: string;
  complement: string;
  city: string;
  state: string;
};

export type SignupContact = {
  phone: string;
  contactEmail: string;
};

export type SignupRequest = {
  fatecEmail: string;
  password: string;
  fullName: string;
  nickname?: string;
  birthDate: string;
  gender: string;
  addresses: SignupAddress[];
  contacts: SignupContact[];
};

export type SignupResponse = {
  id: number;
  fatecEmail: string;
  fullName: string;
};
