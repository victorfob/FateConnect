import { z } from 'zod';

import {
  PASSWORD_CONFIRMATION_MISMATCH,
  SIGNUP_MESSAGES,
  signupSchema,
} from '@app/pages/Signup/schema';

const REQUIRED_MIN_LENGTH = 1;

export const NEW_PASSWORD_MESSAGES = {
  confirmationRequired: 'Confirme a nova senha',
  confirmationMismatch: SIGNUP_MESSAGES.passwordConfirmationMismatch,
};

/** As regras da senha do cadastro: aqui não passa o que lá é recusado. */
export const newPasswordSchema = z
  .object({
    newPassword: signupSchema.shape.password,
    passwordConfirmation: z
      .string()
      .min(REQUIRED_MIN_LENGTH, NEW_PASSWORD_MESSAGES.confirmationRequired),
  })
  .refine(
    ({ newPassword, passwordConfirmation }) => newPassword === passwordConfirmation,
    PASSWORD_CONFIRMATION_MISMATCH,
  );

export type NewPasswordFormValues = z.infer<typeof newPasswordSchema>;
