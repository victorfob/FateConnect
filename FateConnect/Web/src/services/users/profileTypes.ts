export type ProfileInput = {
  fullName: string;
  birthDate: string;
  phone: string;
  contactEmail: string;
  neighborhood: string;
  image: File | null;
};

export type PasswordChangeInput = { currentPassword: string; newPassword: string };
