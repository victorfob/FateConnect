import { z } from 'zod';

import { FATEC_EMAIL_MESSAGE, FATEC_EMAIL_PATTERN } from '@app/constants/fatecEmail';

const REQUIRED_MIN_LENGTH = 1;

export const LOGIN_MESSAGES = {
  emailRequired: 'Informe o e-mail',
  passwordRequired: 'Informe a senha',
};

export const loginSchema = z.object({
  email: z
    .string()
    .min(REQUIRED_MIN_LENGTH, LOGIN_MESSAGES.emailRequired)
    .regex(FATEC_EMAIL_PATTERN, FATEC_EMAIL_MESSAGE),
  password: z.string().min(REQUIRED_MIN_LENGTH, LOGIN_MESSAGES.passwordRequired),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
